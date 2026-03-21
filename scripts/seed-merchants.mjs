import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is required. Set it in your environment before running db:seed.");
  process.exit(1);
}

const sql = neon(databaseUrl);

// NOTE: Replace the baseUrl values with your actual affiliate tracking URLs.
// For example:
//   Amazon Associates: https://www.amazon.in?tag=YOUR_TAG-21
//   Flipkart Affiliate: https://www.flipkart.com?affid=YOUR_AFFID&affExtParam1=YOUR_PARAM
//   Myntra: https://www.myntra.com/?utm_source=affiliate&utm_medium=affiliate_id
// The system appends ?subid=<click_id> to help correlate clicks with your affiliate dashboard.
const merchantsToSeed = [
  {
    name: "Amazon",
    baseUrl: "https://www.amazon.in",
    cashbackRate: "Up to 8%",
    logoUrl: "https://www.google.com/s2/favicons?domain=amazon.in&sz=64",
  },
  {
    name: "Flipkart",
    baseUrl: "https://www.flipkart.com",
    cashbackRate: "Up to 6%",
    logoUrl: "https://www.google.com/s2/favicons?domain=flipkart.com&sz=64",
  },
  {
    name: "Myntra",
    baseUrl: "https://www.myntra.com",
    cashbackRate: "Up to 10%",
    logoUrl: "https://www.google.com/s2/favicons?domain=myntra.com&sz=64",
  },
  {
    name: "Nykaa",
    baseUrl: "https://www.nykaa.com",
    cashbackRate: "Up to 7%",
    logoUrl: "https://www.google.com/s2/favicons?domain=nykaa.com&sz=64",
  },
  {
    name: "Meesho",
    baseUrl: "https://www.meesho.com",
    cashbackRate: "Up to 5%",
    logoUrl: "https://www.google.com/s2/favicons?domain=meesho.com&sz=64",
  },
  {
    name: "AJIO",
    baseUrl: "https://www.ajio.com",
    cashbackRate: "Up to 9%",
    logoUrl: "https://www.google.com/s2/favicons?domain=ajio.com&sz=64",
  },
  {
    name: "Tata CLiQ",
    baseUrl: "https://www.tatacliq.com",
    cashbackRate: "Up to 6%",
    logoUrl: "https://www.google.com/s2/favicons?domain=tatacliq.com&sz=64",
  },
  {
    name: "Snapdeal",
    baseUrl: "https://www.snapdeal.com",
    cashbackRate: "Up to 5%",
    logoUrl: "https://www.google.com/s2/favicons?domain=snapdeal.com&sz=64",
  },
];

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

    for (const merchant of merchantsToSeed) {
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

    console.log(`Merchant seed complete. Added ${insertedCount} merchants, updated ${updatedCount} merchants.`);
  } catch (error) {
    console.error("Merchant seed failed:", error);
    process.exitCode = 1;
  }
};

await seed();
