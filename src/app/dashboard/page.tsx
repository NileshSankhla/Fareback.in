import type { Metadata } from "next";
import { and, eq } from "drizzle-orm";

import { signOutAction } from "@/app/actions/auth";
import WithdrawRequestForm from "@/components/wallet/withdraw-request-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { withdrawalRequests } from "@/lib/db/schema";
import { formatDate } from "@/lib/utils";
import { ensureWalletForUser, formatPaiseAsINR } from "@/lib/wallet";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your CashbackCart wallet.",
};

const DashboardPage = async () => {
  const user = await requireUser();
  const wallet = await ensureWalletForUser(user.id);

  const [pendingWithdrawal] = await db
    .select({
      id: withdrawalRequests.id,
      amountInPaise: withdrawalRequests.amountInPaise,
      createdAt: withdrawalRequests.createdAt,
    })
    .from(withdrawalRequests)
    .where(
      and(
        eq(withdrawalRequests.userId, user.id),
        eq(withdrawalRequests.status, "pending"),
      ),
    )
    .limit(1);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Dashboard</CardTitle>
            <CardDescription>
              You are authenticated and connected to your database-backed session.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <div className="rounded-lg border border-border/60 p-4">
                <dt className="text-muted-foreground">Name</dt>
                <dd className="mt-1 font-medium">{user.name ?? "Not set"}</dd>
              </div>
              <div className="rounded-lg border border-border/60 p-4">
                <dt className="text-muted-foreground">Email</dt>
                <dd className="mt-1 font-medium">{user.email}</dd>
              </div>
              <div className="rounded-lg border border-border/60 p-4">
                <dt className="text-muted-foreground">Wallet Balance</dt>
                <dd className="mt-1 font-medium">{formatPaiseAsINR(wallet.balanceInPaise)}</dd>
              </div>
            </dl>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Withdraw to UPI</h3>
              <WithdrawRequestForm hasPendingRequest={Boolean(pendingWithdrawal)} />
              {pendingWithdrawal ? (
                <p className="text-sm text-muted-foreground">
                  Pending request: {formatPaiseAsINR(pendingWithdrawal.amountInPaise)} requested on{" "}
                  {formatDate(pendingWithdrawal.createdAt)}.
                </p>
              ) : null}
            </div>

            <form action={signOutAction}>
              <Button type="submit" variant="outline">
                Sign Out
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
