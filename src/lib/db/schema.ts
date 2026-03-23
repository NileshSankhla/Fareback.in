import {
  boolean,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash"),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const walletTransactionTypeEnum = pgEnum("wallet_transaction_type", [
  "credit",
  "debit",
]);

export const clickTrackingStatusEnum = pgEnum("click_tracking_status", [
  "unreviewed",
  "tracked",
  "approved",
]);

export const withdrawalStatusEnum = pgEnum("withdrawal_status", [
  "pending",
  "approved",
  "rejected",
  "paid",
]);

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
  logoUrl: text("logo_url"),
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
  trackingStatus: clickTrackingStatusEnum("tracking_status")
    .notNull()
    .default("unreviewed"),
  rewardAmountInPaise: integer("reward_amount_in_paise").notNull().default(0),
  reviewedByAdminId: integer("reviewed_by_admin_id").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("clicks_user_id_idx").on(table.userId),
  index("clicks_merchant_id_idx").on(table.merchantId),
  index("clicks_tracking_status_idx").on(table.trackingStatus),
  index("clicks_reviewed_by_admin_id_idx").on(table.reviewedByAdminId),
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

export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  balanceInPaise: integer("balance_in_paise").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("wallets_user_id_idx").on(table.userId),
  check("wallets_balance_non_negative", sql`${table.balanceInPaise} >= 0`),
]);

export const walletTransactions = pgTable("wallet_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: walletTransactionTypeEnum("type").notNull(),
  amountInPaise: integer("amount_in_paise").notNull(),
  note: text("note"),
  adminUserId: integer("admin_user_id").references(() => users.id),
  sourceClickId: uuid("source_click_id").references(() => clicks.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("wallet_transactions_user_id_idx").on(table.userId),
  index("wallet_transactions_admin_user_id_idx").on(table.adminUserId),
  index("wallet_transactions_source_click_id_idx").on(table.sourceClickId),
  index("wallet_transactions_created_at_idx").on(table.createdAt),
  check("wallet_transactions_amount_positive", sql`${table.amountInPaise} > 0`),
]);

export const withdrawalRequests = pgTable("withdrawal_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  upiId: varchar("upi_id", { length: 255 }).notNull(),
  amountInPaise: integer("amount_in_paise").notNull(),
  status: withdrawalStatusEnum("status").notNull().default("pending"),
  adminNote: text("admin_note"),
  processedByAdminId: integer("processed_by_admin_id").references(() => users.id),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("withdrawal_requests_user_id_idx").on(table.userId),
  index("withdrawal_requests_status_idx").on(table.status),
  index("withdrawal_requests_created_at_idx").on(table.createdAt),
  check("withdrawal_requests_amount_positive", sql`${table.amountInPaise} > 0`),
]);
