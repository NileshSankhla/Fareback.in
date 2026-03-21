import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is required. Set it in your environment before running db:seed.");
  process.exit(1);
}

const sql = neon(databaseUrl);

const requestedMerchantNames = (process.env.MERCHANT_NAMES ?? "")
  .split(",")
  .map((name) => name.trim())
  .filter(Boolean);

// NOTE: Testing mode: all merchants use homepage URLs and 2% cashback.
// Replace these baseUrl values with your actual affiliate tracking URLs later.
// For example:
//   Amazon Associates: https://www.amazon.in?tag=YOUR_TAG-21
//   Flipkart Affiliate: https://www.flipkart.com?affid=YOUR_AFFID&affExtParam1=YOUR_PARAM
//   Myntra: https://www.myntra.com/?utm_source=affiliate&utm_medium=affiliate_id
// The system appends ?subid=<click_id> to help correlate clicks with your affiliate dashboard.
const merchantsToSeed = [
  {
    name: "Amazon",
    baseUrl: "https://www.amazon.in",
    cashbackRate: "2%",
    logoUrl: "https://www.google.com/s2/favicons?domain=amazon.in&sz=64",
  },
  {
    name: "Flipkart",
    baseUrl: "https://www.flipkart.com",
    cashbackRate: "2%",
    logoUrl: "https://www.google.com/s2/favicons?domain=flipkart.com&sz=64",
  },
  {
    name: "Myntra",
    baseUrl: "https://www.myntra.com",
    cashbackRate: "2%",
    logoUrl: "https://www.google.com/s2/favicons?domain=myntra.com&sz=64",
  },
  {
    name: "Nykaa",
    baseUrl: "https://www.nykaa.com",
    cashbackRate: "2%",
    logoUrl: "https://www.google.com/s2/favicons?domain=nykaa.com&sz=64",
  },
  {
    name: "Meesho",
    baseUrl: "https://www.meesho.com",
    cashbackRate: "2%",
    logoUrl: "https://www.google.com/s2/favicons?domain=meesho.com&sz=64",
  },
  {
    name: "AJIO",
    baseUrl: "https://www.ajio.com",
    cashbackRate: "2%",
    logoUrl: "https://www.google.com/s2/favicons?domain=ajio.com&sz=64",
  },
  {
    name: "Tata CLiQ",
    baseUrl: "https://www.tatacliq.com",
    cashbackRate: "2%",
    logoUrl: "https://www.google.com/s2/favicons?domain=tatacliq.com&sz=64",
  },
  {
    name: "Snapdeal",
    baseUrl: "https://www.snapdeal.com",
    cashbackRate: "2%",
    logoUrl: "https://www.google.com/s2/favicons?domain=snapdeal.com&sz=64",
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

    console.log(
      `Merchant seed complete for ${filteredMerchants.length} merchant(s). Added ${insertedCount} merchants, updated ${updatedCount} merchants.`,
    );
  } catch (error) {
    console.error("Merchant seed failed:", error);
    process.exitCode = 1;
  }
};

await seed();
