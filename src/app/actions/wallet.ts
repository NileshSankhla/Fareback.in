"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireAdminUser } from "@/lib/admin";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, wallets, withdrawalRequests } from "@/lib/db/schema";
import { adjustWalletBalance, ensureWalletForUser } from "@/lib/wallet";
import {
  adminWithdrawalDecisionSchema,
  walletAdjustmentSchema,
  withdrawalRequestSchema,
} from "@/lib/validations/auth";

export interface WalletActionState {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[] | undefined>;
}

const getString = (value: FormDataEntryValue | null) =>
  typeof value === "string" ? value : "";

const parseRupeesToPaise = (value: string) => Math.round(Number(value) * 100);

export const createWithdrawalRequestAction = async (
  _prevState: WalletActionState,
  formData: FormData,
): Promise<WalletActionState> => {
  try {
    const user = await requireUser();

    const payload = {
      upiId: getString(formData.get("upiId")),
      amount: getString(formData.get("amount")),
    };

    const validation = withdrawalRequestSchema.safeParse(payload);
    if (!validation.success) {
      return {
        error: "Please correct the highlighted fields.",
        fieldErrors: validation.error.flatten().fieldErrors,
      };
    }

    const amountInPaise = parseRupeesToPaise(validation.data.amount);

    if (amountInPaise <= 0) {
      return { error: "Withdrawal amount must be greater than zero." };
    }

    await ensureWalletForUser(user.id);

    const [wallet] = await db
      .select({ balanceInPaise: wallets.balanceInPaise })
      .from(wallets)
      .where(eq(wallets.userId, user.id))
      .limit(1);

    if (!wallet || wallet.balanceInPaise < amountInPaise) {
      return { error: "Insufficient wallet balance." };
    }

    const [pendingCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(withdrawalRequests)
      .where(
        and(
          eq(withdrawalRequests.userId, user.id),
          eq(withdrawalRequests.status, "pending"),
        ),
      );

    if ((pendingCount?.count ?? 0) > 0) {
      return { error: "You already have a pending withdrawal request." };
    }

    await db.insert(withdrawalRequests).values({
      userId: user.id,
      upiId: validation.data.upiId.toLowerCase(),
      amountInPaise,
      status: "pending",
    });

    revalidatePath("/dashboard");
    revalidatePath("/admin");

    return { success: "Withdrawal request submitted successfully." };
  } catch (error) {
    console.error("Create withdrawal request error:", error);
    return { error: "Failed to submit withdrawal request. Please try again." };
  }
};

export const adminAdjustWalletAction = async (
  _prevState: WalletActionState,
  formData: FormData,
): Promise<WalletActionState> => {
  try {
    const admin = await requireAdminUser();

    const payload = {
      userEmail: getString(formData.get("userEmail")).trim().toLowerCase(),
      type: getString(formData.get("type")),
      amount: getString(formData.get("amount")).trim(),
      note: getString(formData.get("note")).trim(),
    };

    const validation = walletAdjustmentSchema.safeParse(payload);
    if (!validation.success) {
      return {
        error: "Please correct the highlighted fields.",
        fieldErrors: validation.error.flatten().fieldErrors,
      };
    }

    const [targetUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, validation.data.userEmail))
      .limit(1);

    if (!targetUser) {
      return { error: "User not found for this email." };
    }

    const amountInPaise = parseRupeesToPaise(validation.data.amount);

    await adjustWalletBalance({
      userId: targetUser.id,
      adminUserId: admin.id,
      type: validation.data.type,
      amountInPaise,
      note: validation.data.note || undefined,
    });

    revalidatePath("/admin");
    revalidatePath("/dashboard");

    return { success: "Wallet updated successfully." };
  } catch (error) {
    console.error("Admin wallet adjust error:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to update wallet. Please try again.",
    };
  }
};

export const adminProcessWithdrawalAction = async (
  _prevState: WalletActionState,
  formData: FormData,
): Promise<WalletActionState> => {
  try {
    const admin = await requireAdminUser();

    const payload = {
      requestId: getString(formData.get("requestId")),
      decision: getString(formData.get("decision")),
      note: getString(formData.get("note")).trim(),
    };

    const validation = adminWithdrawalDecisionSchema.safeParse(payload);
    if (!validation.success) {
      return {
        error: "Please correct the highlighted fields.",
        fieldErrors: validation.error.flatten().fieldErrors,
      };
    }

    const requestId = Number(validation.data.requestId);

    const [request] = await db
      .select()
      .from(withdrawalRequests)
      .where(eq(withdrawalRequests.id, requestId))
      .limit(1);

    if (!request) {
      return { error: "Withdrawal request not found." };
    }

    if (request.status !== "pending" && validation.data.decision !== "mark-paid") {
      return { error: "Only pending requests can be approved or rejected." };
    }

    if (validation.data.decision === "reject") {
      await db
        .update(withdrawalRequests)
        .set({
          status: "rejected",
          adminNote: validation.data.note || null,
          processedByAdminId: admin.id,
          processedAt: new Date(),
        })
        .where(eq(withdrawalRequests.id, request.id));

      revalidatePath("/admin");
      revalidatePath("/dashboard");
      return { success: "Withdrawal request rejected." };
    }

    if (validation.data.decision === "approve") {
      const [wallet] = await db
        .select()
        .from(wallets)
        .where(eq(wallets.userId, request.userId))
        .limit(1);

      if (!wallet || wallet.balanceInPaise < request.amountInPaise) {
        return { error: "User wallet does not have enough balance." };
      }

      await adjustWalletBalance({
        userId: request.userId,
        adminUserId: admin.id,
        type: "debit",
        amountInPaise: request.amountInPaise,
        note: `Withdrawal approved (#${request.id})`,
      });

      await db
        .update(withdrawalRequests)
        .set({
          status: "approved",
          adminNote: validation.data.note || null,
          processedByAdminId: admin.id,
          processedAt: new Date(),
        })
        .where(eq(withdrawalRequests.id, request.id));

      revalidatePath("/admin");
      revalidatePath("/dashboard");
      return { success: "Withdrawal approved. Wallet debited." };
    }

    await db
      .update(withdrawalRequests)
      .set({
        status: "paid",
        adminNote: validation.data.note || null,
        processedByAdminId: admin.id,
        processedAt: new Date(),
      })
      .where(eq(withdrawalRequests.id, request.id));

    revalidatePath("/admin");
    return { success: "Withdrawal marked as paid." };
  } catch (error) {
    console.error("Admin process withdrawal error:", error);
    return { error: "Failed to process withdrawal request." };
  }
};

export const adminProcessWithdrawalFormAction = async (formData: FormData) => {
  await adminProcessWithdrawalAction({}, formData);
};
