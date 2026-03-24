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

// NOTE: Testing mode: supported merchants use configured URLs and 3.7% cashback.
// Replace these baseUrl values with your actual affiliate tracking URLs later.
// For example:
//   Amazon Associates: https://www.amazon.in?tag=YOUR_TAG-21
//   Flipkart Affiliate: https://fktr.in/49T8I82
//   Myntra: https://myntr.it/auK4aA9
//   AJIO: https://ajiio.in/xTvzcfm
// The system appends ?subid=<click_id> to help correlate clicks with your affiliate dashboard.
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
