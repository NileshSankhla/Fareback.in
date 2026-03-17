import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is required. Set it in your environment before running db:seed.");
  process.exit(1);
}

const sql = postgres(databaseUrl, { prepare: false });

const merchantsToSeed = [
  {
    name: "Amazon",
    baseUrl: "https://www.amazon.com",
    cashbackRate: "2%",
  },
  {
    name: "Flipkart",
    baseUrl: "https://www.flipkart.com",
    cashbackRate: "3%",
  },
  {
    name: "Myntra",
    baseUrl: "https://www.myntra.com",
    cashbackRate: "4%",
  },
  {
    name: "Nykaa",
    baseUrl: "https://www.nykaa.com",
    cashbackRate: "5%",
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
            updated_at = now()
          where id = ${existing[0].id}
        `;
        updatedCount += 1;
        continue;
      }

      await sql`
        insert into merchants (network_id, name, base_url, cashback_rate)
        values (${network.id}, ${merchant.name}, ${merchant.baseUrl}, ${merchant.cashbackRate})
      `;

      insertedCount += 1;
    }

    console.log(`Merchant seed complete. Added ${insertedCount} merchants, updated ${updatedCount} merchants.`);
  } catch (error) {
    console.error("Merchant seed failed:", error);
    process.exitCode = 1;
  } finally {
    await sql.end();
  }
};

await seed();
