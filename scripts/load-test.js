#!/usr/bin/env node

/**
 * Load test script for Fareback
 * Run: npm run load-test -- --url http://localhost:3000 --connections 100 --duration 30
 * Or: npm run load-test:quick (defaults: localhost:3000, 50 connections, 20s)
 */

const assert = require("assert");

async function runLoadTest() {
  const args = process.argv.slice(2);
  const url = getArgValue(args, "--url") || "http://127.0.0.1:3000";
  const connections = parseInt(getArgValue(args, "--connections") || "50", 10);
  const duration = parseInt(getArgValue(args, "--duration") || "20", 10);

  console.log(`
╔════════════════════════════════════════════════════════════╗
║              Fareback Load Test                             ║
╚════════════════════════════════════════════════════════════╝

Target: ${url}
Connections: ${connections}
Duration: ${duration}s

Warming up...
  `);

  try {
    const nodePath = require.resolve("autocannon/cmd", { paths: [process.cwd()] }).replace("/cmd.js", "");
    const autocannon = require("autocannon");

    const result = await autocannon({
      url,
      connections,
      duration,
      pipelining: 10,
      requests: [
        {
          path: "/",
          method: "GET",
        },
        {
          path: "/api/health/db",
          method: "GET",
        },
      ],
    });

    console.log("\n");
    console.log(
      "Requests/sec:",
      Math.floor(result.requests.average),
      `(${result.requests.total} total)`
    );
    console.log("Latency (avg):", Math.floor(result.latency.mean), "ms");
    console.log("Latency (p99):", Math.floor(result.latency.p99), "ms");
    console.log("Throughput:", formatBytes(result.throughput.average), "/sec");
    console.log("Errors:", result.errors);
    console.log("\n");

    // Recommendations
    const avgLatency = result.latency.mean;
    const p99Latency = result.latency.p99;
    const reqPerSec = result.requests.average;

    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║                    Capacity Estimate                        ║");
    console.log("╚════════════════════════════════════════════════════════════╝\n");

    console.log(`Req/Sec: ${Math.floor(reqPerSec)}`);
    console.log(`P99 Latency: ${Math.floor(p99Latency)}ms`);
    console.log("\nAssuming users generate ~0.1 req/sec (one request every 10s):");
    console.log(`  Safe capacity: ~${Math.floor(reqPerSec * 0.3 / 0.1)} concurrent users (30% headroom)`);
    console.log(`  Peak capacity: ~${Math.floor(reqPerSec * 0.5 / 0.1)} concurrent users (50% headroom)`);

    if (avgLatency > 500) {
      console.log("\n⚠️  WARNING: Average latency is high (>500ms)");
      console.log("   → Check database connection pool");
      console.log("   → Verify deployment region vs database region");
    }

    if (p99Latency > 1000) {
      console.log("\n⚠️  WARNING: P99 latency is high (>1s)");
      console.log("   → Consider scaling database or adding caching");
    }

    if (result.errors > 0) {
      console.log(`\n⚠️  WARNING: ${result.errors} errors detected`);
      console.log("   → Check server logs for details");
    }

    console.log("\n");
  } catch (error) {
    console.error("Load test failed:", error.message);
    console.log("\nMake sure to:");
    console.log("  1. npm install autocannon");
    console.log("  2. Start the server: npm run start");
    console.log("  3. Run this script in another terminal");
    process.exit(1);
  }
}

function getArgValue(args, flag) {
  const index = args.indexOf(flag);
  return index >= 0 && index < args.length - 1 ? args[index + 1] : null;
}

function formatBytes(bytes) {
  if (bytes < 1024) return Math.round(bytes) + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

runLoadTest().catch(console.error);
