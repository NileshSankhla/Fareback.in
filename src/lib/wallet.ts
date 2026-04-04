import "server-only";

import { and, eq, gte, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  walletTransactions,
  walletTypeEnum,
  wallets,
  type walletTransactionTypeEnum,
} from "@/lib/db/schema";

const clampToPaise = (value: number) => Math.max(0, Math.round(value));

const isUniqueConstraintError = (error: unknown) =>
  typeof error === "object"
  && error !== null
  && "code" in error
  && (error as { code?: string }).code === "23505";

export type WalletType = (typeof walletTypeEnum.enumValues)[number];

export const DEFAULT_WALLET_TYPE: WalletType = "cashback";
export const AMAZON_REWARDS_WALLET_TYPE: WalletType = "amazon_rewards";

export const ensureWalletForUser = async (userId: number, walletType: WalletType = DEFAULT_WALLET_TYPE) => {
  const [wallet] = await db
    .select()
    .from(wallets)
    .where(and(eq(wallets.userId, userId), eq(wallets.walletType, walletType)))
    .limit(1);

  if (wallet) {
    return wallet;
  }

  await db
    .insert(wallets)
    .values({ userId, walletType, balanceInPaise: 0 })
    .onConflictDoNothing({ target: [wallets.userId, wallets.walletType] });

  const [ensuredWallet] = await db
    .select()
    .from(wallets)
    .where(and(eq(wallets.userId, userId), eq(wallets.walletType, walletType)))
    .limit(1);

  if (!ensuredWallet) {
    throw new Error("Failed to create wallet.");
  }

  return ensuredWallet;
};

export const ensureWalletsForUser = async (userId: number) => {
  const [cashbackWallet, amazonRewardsWallet] = await Promise.all([
    ensureWalletForUser(userId, DEFAULT_WALLET_TYPE),
    ensureWalletForUser(userId, AMAZON_REWARDS_WALLET_TYPE),
  ]);

  return { cashbackWallet, amazonRewardsWallet };
};

export const getWalletBalance = async (userId: number, walletType: WalletType = DEFAULT_WALLET_TYPE) => {
  const wallet = await ensureWalletForUser(userId, walletType);
  return wallet.balanceInPaise;
};

export const adjustWalletBalance = async (
  params: {
    userId: number;
    adminUserId?: number;
    walletType?: WalletType;
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

  const walletType = params.walletType ?? DEFAULT_WALLET_TYPE;
  const wallet = await ensureWalletForUser(params.userId, walletType);

  const nextBalanceSql =
    params.type === "credit"
      ? sql`${wallets.balanceInPaise} + ${amountInPaise}`
      : sql`${wallets.balanceInPaise} - ${amountInPaise}`;

  const balanceGuard =
    params.type === "debit"
      ? gte(wallets.balanceInPaise, amountInPaise)
      : undefined;

  return db.transaction(async (tx) => {
    const [updatedWallet] = await tx
      .update(wallets)
      .set({
        balanceInPaise: nextBalanceSql,
        updatedAt: new Date(),
      })
      .where(
        balanceGuard
          ? and(
              eq(wallets.id, wallet.id),
              eq(wallets.userId, params.userId),
              eq(wallets.walletType, walletType),
              balanceGuard,
            )
          : and(
              eq(wallets.id, wallet.id),
              eq(wallets.userId, params.userId),
              eq(wallets.walletType, walletType),
            ),
      )
      .returning();

    if (!updatedWallet) {
      throw new Error("Insufficient wallet balance.");
    }

    try {
      await tx.insert(walletTransactions).values({
        userId: params.userId,
        adminUserId: params.adminUserId,
        walletType,
        type: params.type,
        amountInPaise,
        note: params.note,
        sourceClickId: params.sourceClickId,
      });
    } catch (error) {
      if (params.sourceClickId && isUniqueConstraintError(error)) {
        throw new Error("Reward already processed for this click.");
      }
      throw error;
    }

    return updatedWallet;
  });
};
