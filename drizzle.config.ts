import { defineConfig } from "drizzle-kit";

// Prefer the direct (non-pooled) URL for migrations so that drizzle-kit can
// run DDL statements over a standard connection rather than through PgBouncer.
// Falls back to DATABASE_URL for local development where there is only one URL.
const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

if (!url) {
  throw new Error(
    "Set DATABASE_URL_UNPOOLED (or DATABASE_URL) before running drizzle-kit commands.",
  );
}

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url,
  },
});
