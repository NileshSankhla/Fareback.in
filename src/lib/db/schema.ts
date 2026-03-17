import {
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const networks = pgTable("networks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  postbackSecret: text("postback_secret"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const merchants = pgTable("merchants", {
  id: serial("id").primaryKey(),
  networkId: integer("network_id").references(() => networks.id, {
    onDelete: "cascade",
  }),
  name: text("name").notNull(),
  baseUrl: text("base_url").notNull(),
  cashbackRate: text("cashback_rate").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("merchants_network_id_idx").on(table.networkId),
]);

export const clicks = pgTable("clicks", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  merchantId: integer("merchant_id")
    .notNull()
    .references(() => merchants.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("clicks_user_id_idx").on(table.userId),
  index("clicks_merchant_id_idx").on(table.merchantId),
  index("clicks_created_at_idx").on(table.createdAt),
]);

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("sessions_user_id_idx").on(table.userId),
  index("sessions_expires_at_idx").on(table.expiresAt),
  index("sessions_token_idx").on(table.token),
]);
