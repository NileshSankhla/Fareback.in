#!/usr/bin/env node

/**
 * Test script to verify affiliate link rotation with concurrent users
 * Run: node scripts/test-affiliate-rotation.js
 */

const http = require("http");
const https = require("https");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const CONCURRENT_USERS = 20;
const REQUESTS_PER_USER = 5;

// Parse URL to determine protocol
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    protocol
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            redirectUrl: res.headers.location || null,
          });
        });
      })
      .on("error", reject);
  });
}

async function testAffiliateRotation() {
  console.log("🧪 Testing Affiliate Link Rotation System\n");
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Concurrent Users: ${CONCURRENT_USERS}`);
  console.log(`Requests per User: ${REQUESTS_PER_USER}\n`);

  const results = {
    totalRequests: 0,
    successfulRedirects: 0,
    failures: [],
    linkIndices: new Map(),
  };

  try {
    // Simulate multiple concurrent users making requests
    const userPromises = [];

    for (let userIdx = 0; userIdx < CONCURRENT_USERS; userIdx++) {
      const userPromise = (async () => {
        const userResults = [];

        for (let reqIdx = 0; reqIdx < REQUESTS_PER_USER; reqIdx++) {
          try {
            const redirectUrl = `${BASE_URL}/api/redirect?merchantId=1`;
            console.log(
              `User ${userIdx + 1}, Request ${reqIdx + 1}: Testing...`
            );

            const response = await makeRequest(redirectUrl);
            results.totalRequests++;

            if (response.status === 307 && response.redirectUrl) {
              results.successfulRedirects++;
              const url = response.redirectUrl;

              // Try to extract affiliate link info from the redirect
              try {
                const linkIndex = extractLinkIndexFromUrl(url);
                userResults.push({
                  user: userIdx + 1,
                  request: reqIdx + 1,
                  url: url.substring(0, 100) + "...",
                  linkIndex,
                });

                if (linkIndex !== null) {
                  const count = (results.linkIndices.get(linkIndex) || 0) + 1;
                  results.linkIndices.set(linkIndex, count);
                }
              } catch (e) {
                console.warn("Could not extract link index from URL");
              }
            } else {
              results.failures.push({
                user: userIdx + 1,
                request: reqIdx + 1,
                status: response.status,
              });
            }

            // Small delay between requests to see rotation
            await new Promise((resolve) => setTimeout(resolve, 50));
          } catch (error) {
            results.failures.push({
              user: userIdx + 1,
              request: reqIdx + 1,
              error: error.message,
            });
          }
        }

        return userResults;
      })();

      userPromises.push(userPromise);
    }

    // Wait for all concurrent requests
    console.log("\n⏳ Running concurrent requests...\n");
    const allResults = await Promise.all(userPromises);

    // Print results
    console.log("\n📊 Test Results:\n");
    console.log(`Total Requests: ${results.totalRequests}`);
    console.log(
      `Successful Redirects: ${results.successfulRedirects}/${results.totalRequests}`
    );
    console.log(`Failed Requests: ${results.failures.length}`);

    if (results.linkIndices.size > 0) {
      console.log("\n🔗 Link Index Distribution:");
      const sortedIndices = Array.from(results.linkIndices.entries()).sort(
        (a, b) => a[0] - b[0]
      );
      sortedIndices.forEach(([index, count]) => {
        const bar = "█".repeat(Math.ceil(count / 2));
        console.log(`  User${index + 1} (index ${index}): ${bar} (${count})`);
      });

      // Check if links are rotating properly
      if (sortedIndices.length > 1) {
        console.log("\n✅ Rotation verified! Multiple links were used.");
      } else if (sortedIndices.length === 1) {
        console.log("\n⚠️  Only one link index used. Check counter table...");
      }
    }

    if (results.failures.length > 0) {
      console.log("\n❌ Failed Requests:");
      results.failures.slice(0, 5).forEach((failure) => {
        console.log(
          `  User ${failure.user}, Request ${failure.request}: ${failure.error || `Status ${failure.status}`}`
        );
      });
      if (results.failures.length > 5) {
        console.log(`  ... and ${results.failures.length - 5} more`);
      }
    }

    console.log("\n✨ Test completed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

function extractLinkIndexFromUrl(url) {
  // Extract affiliate link index from URL if available
  // This is a simplified extraction - in real scenario would parse from database
  const match = url.match(/tag=fareback-([0-9]+)|affiliate.*?([0-9]+)/i);
  return match ? parseInt(match[1] || match[2]) : null;
}

// Run test
testAffiliateRotation();
