import { neon } from "@neondatabase/serverless";
import { Redis } from "@upstash/redis";
import { readFileSync } from "fs";
import { resolve } from "path";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is required. Set it in your environment before running db:seed.");
  process.exit(1);
}

const sql = neon(databaseUrl);

const REDIS_LINKS_KEY = process.env.AFFILIATE_REDIS_LIST_KEY || "affiliate:amazon:links";
const REDIS_COUNTER_KEY = "affiliate:amazon:counter";

const requestedMerchantNames = (process.env.MERCHANT_NAMES ?? "")
  .split(",")
  .map((name) => name.trim())
  .filter(Boolean);

const merchantsToSeed = [
  {
    name: "Amazon",
    baseUrl:
      "https://www.amazon.in?&linkCode=ll2&tag=fareback-21&linkId=711b78face92a1bf8be6139d25b1f780&ref_=as_li_ss_tl",
    cashbackRate: "3.7%",
    logoUrl: "https://www.google.com/s2/favicons?domain=amazon.in&sz=64",
  },
  {
    name: "Flipkart",
    baseUrl: "https://fktr.in/49T8I82",
    cashbackRate: "3.7%",
    logoUrl: "https://www.google.com/s2/favicons?domain=flipkart.com&sz=64",
  },
  {
    name: "Myntra",
    baseUrl: "https://myntr.it/auK4aA9",
    cashbackRate: "3.7%",
    logoUrl: "https://www.google.com/s2/favicons?domain=myntra.com&sz=64",
  },
  {
    name: "AJIO",
    baseUrl: "https://ajiio.in/xTvzcfm",
    cashbackRate: "3.7%",
    logoUrl: "https://www.google.com/s2/favicons?domain=ajio.com&sz=64",
  },
];

const normalizeName = (name) => name.trim().toLowerCase();
const requestedNameSet = new Set(requestedMerchantNames.map(normalizeName));

const filteredMerchants =
  requestedMerchantNames.length === 0
    ? merchantsToSeed
    : merchantsToSeed.filter((merchant) => requestedNameSet.has(normalizeName(merchant.name)));

if (requestedMerchantNames.length > 0) {
  const configuredNames = new Set(merchantsToSeed.map((m) => normalizeName(m.name)));
  const unknownNames = requestedMerchantNames.filter(
    (name) => !configuredNames.has(normalizeName(name)),
  );

  if (unknownNames.length > 0) {
    console.error(
      `Unknown merchants in MERCHANT_NAMES: ${unknownNames.join(", ")}. Allowed: ${merchantsToSeed
        .map((m) => m.name)
        .join(", ")}`,
    );
    process.exit(1);
  }
}

const parseAffiliateCsv = () => {
  const csvPath = resolve(process.cwd(), "amazonlinks.csv");
  const content = readFileSync(csvPath, "utf8");

  const links = [];
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    const value = line.replace(/^"|"$/g, "").trim();
    if (!value || value.toLowerCase() === "url") {
      continue;
    }

    try {
      const parsed = new URL(value);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        links.push(parsed.toString());
      }
    } catch {
      // Ignore malformed lines.
    }
  }

  return links;
};

const syncAffiliateLinksToRedis = async (links) => {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    console.log("Upstash Redis env missing; skipped Redis affiliate link sync.");
    return;
  }

  const redis = new Redis({ url, token });
  await redis.del(REDIS_LINKS_KEY);
  if (links.length > 0) {
    await redis.rpush(REDIS_LINKS_KEY, ...links);
  }
  await redis.set(REDIS_COUNTER_KEY, 0);
  console.log(`Redis affiliate list synced. Key=${REDIS_LINKS_KEY}, links=${links.length}`);
};

const seed = async () => {
  try {
    const [network] = await sql`
      insert into networks (name)
      values ('Default Network')
      on conflict (name) do update set updated_at = now()
      returning id
    `;

    let insertedCount = 0;
    let updatedCount = 0;

    if (filteredMerchants.length === 0) {
      console.log("No merchants selected. Nothing to seed.");
      return;
    }

    for (const merchant of filteredMerchants) {
      const existing = await sql`
        select id
        from merchants
        where name = ${merchant.name}
        limit 1
      `;

      if (existing.length > 0) {
        await sql`
          update merchants
          set
            network_id = ${network.id},
            base_url = ${merchant.baseUrl},
            cashback_rate = ${merchant.cashbackRate},
            logo_url = ${merchant.logoUrl},
            updated_at = now()
          where id = ${existing[0].id}
        `;
        updatedCount += 1;
        continue;
      }

      await sql`
        insert into merchants (network_id, name, base_url, cashback_rate, logo_url)
        values (${network.id}, ${merchant.name}, ${merchant.baseUrl}, ${merchant.cashbackRate}, ${merchant.logoUrl})
      `;

      insertedCount += 1;
    }

    const [amazonMerchant] = await sql`
      select id
      from merchants
      where lower(name) = 'amazon'
      limit 1
    `;

    if (!amazonMerchant?.id) {
      throw new Error("Amazon merchant not found after merchant seeding.");
    }

    const affiliateLinks = parseAffiliateCsv();
    if (affiliateLinks.length === 0) {
      throw new Error("No valid affiliate URLs found in amazonlinks.csv");
    }

    await sql`
      delete from affiliate_links
      where merchant_id = ${amazonMerchant.id}
    `;

    for (let i = 0; i < affiliateLinks.length; i += 1) {
      await sql`
        insert into affiliate_links (merchant_id, link_number, url, is_active)
        values (${amazonMerchant.id}, ${i + 1}, ${affiliateLinks[i]}, true)
      `;
    }

    await syncAffiliateLinksToRedis(affiliateLinks);

    console.log(
      `Merchant seed complete for ${filteredMerchants.length} merchant(s). Added ${insertedCount} merchants, updated ${updatedCount} merchants.`,
    );
    console.log(`Affiliate links seeded: ${affiliateLinks.length}`);
  } catch (error) {
    console.error("Merchant seed failed:", error);
    process.exitCode = 1;
  }
};

await seed();
