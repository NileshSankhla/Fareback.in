import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL environment variable is not set. " +
      "Copy .env.example to .env.local and set DATABASE_URL, or connect a Neon database in your Vercel project settings.",
  );
}

// Singleton: reuse the connection across hot-reloads in development so we do
// not exhaust the Neon connection limit while iterating locally.
const globalForDb = globalThis as unknown as {
  _pgClient: ReturnType<typeof postgres> | undefined;
};

// Disable prefetch as it is not supported for "transaction" pool mode
const client = globalForDb._pgClient ?? postgres(connectionString, { prepare: false });

if (process.env.NODE_ENV !== "production") {
  globalForDb._pgClient = client;
}

export const db = drizzle(client, { schema });
