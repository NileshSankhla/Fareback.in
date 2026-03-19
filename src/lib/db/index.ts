import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set.");
}

// In development, cache the client on globalThis so that Next.js hot-module
// replacement doesn't create a new postgres connection pool on every reload.
// In production (Vercel serverless) each function instance is isolated, so
// max:1 ensures at most one connection is opened per instance.
const globalForPg = globalThis as typeof globalThis & { _pgClient?: postgres.Sql };
const _pgClient =
  globalForPg._pgClient ??
  postgres(connectionString, { prepare: false, max: 1 });

if (process.env.NODE_ENV !== "production") {
  globalForPg._pgClient = _pgClient;
}

export const db = drizzle(_pgClient, { schema });
