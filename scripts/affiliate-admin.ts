/**
 * Admin utility script to monitor affiliate link rotation system
 * Usage: bun scripts/affiliate-admin.ts [command]
 * Commands: status, reset, stats
 */

import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import {
  loadAmazonAffiliateLinks,
  getTotalAffiliateLinks,
  getAffiliateLink,
} from "@/lib/affiliate-links";
import {
  getCurrentCounterValue,
  resetCounterValue,
} from "@/lib/affiliate-rotation";

const command = process.argv[2] || "status";

async function showStatus() {
  console.log("📊 Affiliate Link Rotation System Status\n");

  try {
    // Load affiliate links
    const totalLinks = getTotalAffiliateLinks();
    console.log(`✅ Affiliate Links Loaded: ${totalLinks} links`);

    // Get current counter
    const counter = await getCurrentCounterValue();
    const currentIndex = counter % totalLinks;
    console.log(`📍 Current Counter Value: ${counter}`);
    console.log(`📍 Current Link Index: ${currentIndex} (User${currentIndex + 1})`);

    // Get sample links
    console.log("\n🔗 Sample Links:");
    console.log(`  Link 1 (index 0): ${getAffiliateLink(0).substring(0, 80)}...`);
    console.log(
      `  Link ${totalLinks} (index ${totalLinks - 1}): ${getAffiliateLink(totalLinks - 1).substring(0, 80)}...`
    );

    // Database stats
    const clickStats = await db.execute(
      sql.raw(`
        SELECT 
          COUNT(*) as total_clicks,
          COUNT(CASE WHEN affiliate_link_index IS NOT NULL THEN 1 END) as tracked_clicks
        FROM clicks
        WHERE merchant_id IN (SELECT id FROM merchants WHERE name = 'amazon')
      `)
    );

    if (clickStats.rows && clickStats.rows.length > 0) {
      const row = clickStats.rows[0] as {
        total_clicks: number;
        tracked_clicks: number;
      };
      console.log(`\n📈 Statistics for Amazon:`);
      console.log(`  Total Clicks: ${row.total_clicks}`);
      console.log(`  Tracked with Affiliate Link: ${row.tracked_clicks}`);
    }

    console.log("\n✨ System Status: OK");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

async function showStats() {
  console.log("📊 Affiliate Link Stats\n");

  try {
    const totalLinks = getTotalAffiliateLinks();
    const counter = await getCurrentCounterValue();

    // Distribution of links
    const distribution = await db.execute(
      sql.raw(`
        SELECT 
          affiliate_link_index,
          COUNT(*) as count,
          MAX(created_at) as last_used
        FROM clicks
        WHERE affiliate_link_index IS NOT NULL AND merchant_id IN (
          SELECT id FROM merchants WHERE name = 'amazon'
        )
        GROUP BY affiliate_link_index
        ORDER BY count DESC
        LIMIT 20
      `)
    );

    console.log("Top 20 Most Used Links:");
    if (distribution.rows) {
      (distribution.rows as Array<{
        affiliate_link_index: number;
        count: number;
        last_used: string;
      }>).forEach((row) => {
        console.log(
          `  User${row.affiliate_link_index + 1} (index ${row.affiliate_link_index}): ${row.count} clicks`
        );
      });
    }

    console.log(`\nTotal Counter Value: ${counter}`);
    console.log(`Current Link Index: ${counter % totalLinks} (User${(counter % totalLinks) + 1})`);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

async function resetCounter() {
  console.log("🔄 Resetting affiliate link counter...\n");

  try {
    await resetCounterValue(0);
    console.log("✅ Counter reset to 0");
    console.log("ℹ️  Next click will use affiliate link 1 (User1)");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

async function main() {
  switch (command) {
    case "status":
      await showStatus();
      break;
    case "stats":
      await showStats();
      break;
    case "reset":
      await resetCounter();
      break;
    default:
      console.log(
        "Usage: bun scripts/affiliate-admin.ts [command]\n\nCommands:"
      );
      console.log("  status - Show current system status");
      console.log("  stats  - Show link usage statistics");
      console.log("  reset  - Reset counter to 0");
  }

  process.exit(0);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
