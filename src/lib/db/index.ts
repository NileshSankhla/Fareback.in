import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set.");
}

// Enforce online-only database usage for all environments.
if (/localhost|127\.0\.0\.1/.test(connectionString)) {
  throw new Error(
    "Local database URLs are disabled. Set DATABASE_URL to your Neon pooled connection string.",
  );
}

const sql = neon(connectionString);

export const db = drizzle({ client: sql, schema });
