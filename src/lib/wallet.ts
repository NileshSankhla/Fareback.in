import "server-only";

import { and, eq, gte, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  walletTransactions,
  wallets,
  type walletTransactionTypeEnum,
} from "@/lib/db/schema";

const clampToPaise = (value: number) => Math.max(0, Math.round(value));

export const ensureWalletForUser = async (userId: number) => {
  const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);

  if (wallet) {
    return wallet;
  }

  const [createdWallet] = await db
    .insert(wallets)
    .values({ userId, balanceInPaise: 0 })
    .returning();

  return createdWallet;
};

export const adjustWalletBalance = async (
  params: {
    userId: number;
    adminUserId?: number;
    type: (typeof walletTransactionTypeEnum.enumValues)[number];
    amountInPaise: number;
    note?: string;
    sourceClickId?: string;
  }
) => {
  const amountInPaise = clampToPaise(params.amountInPaise);
  if (amountInPaise <= 0) {
    throw new Error("Amount must be greater than zero.");
  }

  const wallet = await ensureWalletForUser(params.userId);

  const nextBalanceSql =
    params.type === "credit"
      ? sql`${wallets.balanceInPaise} + ${amountInPaise}`
      : sql`${wallets.balanceInPaise} - ${amountInPaise}`;

  const balanceGuard =
    params.type === "debit"
      ? gte(wallets.balanceInPaise, amountInPaise)
      : undefined;

  const [updatedWallet] = await db
    .update(wallets)
    .set({
      balanceInPaise: nextBalanceSql,
      updatedAt: new Date(),
    })
    .where(
      balanceGuard
        ? and(eq(wallets.id, wallet.id), eq(wallets.userId, params.userId), balanceGuard)
        : and(eq(wallets.id, wallet.id), eq(wallets.userId, params.userId)),
    )
    .returning();

  if (!updatedWallet) {
    throw new Error("Insufficient wallet balance.");
  }

  await db.insert(walletTransactions).values({
    userId: params.userId,
    adminUserId: params.adminUserId,
    type: params.type,
    amountInPaise,
    note: params.note,
    sourceClickId: params.sourceClickId,
  });

  return updatedWallet;
};
