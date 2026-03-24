#!/usr/bin/env node

/**
 * Load test script for Fareback
 * Run: npm run load-test -- --url http://localhost:3000 --connections 100 --duration 30
 * Example realistic browser profile:
 * npm run load-test -- --url https://fareback.in/dashboard --connections 50 --duration 20 --pipelining 1
 */

async function runLoadTest() {
  const args = process.argv.slice(2);
  const rawUrl = getArgValue(args, "--url") || "http://127.0.0.1:3000/";
  const connections = parseInt(getArgValue(args, "--connections") || "50", 10);
  const duration = parseInt(getArgValue(args, "--duration") || "20", 10);
  const pipelining = parseInt(getArgValue(args, "--pipelining") || "1", 10);
  const mixed = getBooleanArg(args, "--mixed", false);

  const parsed = new URL(rawUrl);
  const origin = parsed.origin;
  const targetPath = `${parsed.pathname || "/"}${parsed.search || ""}`;

  console.log(`
╔════════════════════════════════════════════════════════════╗
║              Fareback Load Test                            ║
╚════════════════════════════════════════════════════════════╝

Target: ${rawUrl}
Connections: ${connections}
Duration: ${duration}s
Pipelining: ${pipelining}
Mode: ${mixed ? "mixed (/ + /api/health/db)" : `single (${targetPath})`}

Warming up...
`);

  try {
    const { default: autocannon } = await import("autocannon");

    const options = {
      url: origin,
      connections,
      duration,
      pipelining,
      requests: mixed
        ? [
            { path: "/", method: "GET" },
            { path: "/api/health/db", method: "GET" },
          ]
        : [{ path: targetPath, method: "GET" }],
    };

    const result = await autocannon(options);

    const reqPerSec = result.requests.average;
    const avgLatency = result.latency.mean;
    const p99Latency = result.latency.p99;
    const non2xx = result.non2xx ?? 0;

    console.log("\n");
    console.log("Requests/sec:", Math.floor(reqPerSec), `(${result.requests.total} total)`);
    console.log("Latency (avg):", Math.floor(avgLatency), "ms");
    console.log("Latency (p99):", Math.floor(p99Latency), "ms");
    console.log("Throughput:", formatBytes(result.throughput.average), "/sec");
    console.log("Errors:", result.errors);
    console.log("Non-2xx:", non2xx);
    console.log("Timeouts:", result.timeouts ?? 0);

    console.log("\n");
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║                    Capacity Estimate                       ║");
    console.log("╚════════════════════════════════════════════════════════════╝\n");

    console.log(`Req/Sec: ${Math.floor(reqPerSec)}`);
    console.log(`P99 Latency: ${Math.floor(p99Latency)}ms`);
    console.log("\nAssuming users generate ~0.1 req/sec (one request every 10s):");
    console.log(`  Safe capacity: ~${Math.floor((reqPerSec * 0.3) / 0.1)} concurrent users (30% headroom)`);
    console.log(`  Peak capacity: ~${Math.floor((reqPerSec * 0.5) / 0.1)} concurrent users (50% headroom)`);

    if (avgLatency > 500) {
      console.log("\nWARNING: Average latency is high (>500ms)");
      console.log("  - Check database connection pool");
      console.log("  - Verify app and database regions match");
    }

    if (p99Latency > 1000) {
      console.log("\nWARNING: P99 latency is high (>1s)");
      console.log("  - Consider caching or DB scaling");
    }

    if (result.errors > 0 || non2xx > 0) {
      console.log("\nWARNING: Request failures detected");
      console.log("  - Inspect Vercel logs during the run");
      console.log("  - Validate DB health endpoint at /api/health/db");
    }

    console.log("\n");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Load test failed:", message);
    console.log("\nMake sure to:");
    console.log("  1. npm install");
    console.log("  2. Run against a reachable URL");
    process.exit(1);
  }
}

function getArgValue(args, flag) {
  const index = args.indexOf(flag);
  return index >= 0 && index < args.length - 1 ? args[index + 1] : null;
}

function getBooleanArg(args, flag, defaultValue) {
  const raw = getArgValue(args, flag);
  if (raw === null) return defaultValue;
  return raw === "true" || raw === "1";
}

function formatBytes(bytes) {
  if (bytes < 1024) return Math.round(bytes) + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

runLoadTest().catch((error) => {
  console.error(error);
  process.exit(1);
});
