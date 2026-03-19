import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// Disable prefetch as it is not supported for "transaction" pool mode.
// Limit to 1 connection per serverless function instance to avoid
// exhausting Neon's connection pool across concurrent Vercel invocations.
const client = postgres(connectionString, { prepare: false, max: 1 });

export const db = drizzle(client, { schema });
