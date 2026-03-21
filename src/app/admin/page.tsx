import type { Metadata } from "next";
import { desc, eq, sql } from "drizzle-orm";

import {
  adminProcessWithdrawalFormAction,
} from "@/app/actions/wallet";
import AdminWalletAdjustForm from "@/components/admin/admin-wallet-adjust-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requireAdminUser } from "@/lib/admin";
import { db } from "@/lib/db";
import {
  clicks,
  merchants,
  users,
  wallets,
  walletTransactions,
  withdrawalRequests,
} from "@/lib/db/schema";
import { formatPaiseAsINR } from "@/lib/wallet";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Admin",
  description: "Fareback admin operations panel.",
};

const AdminPage = async () => {
  await requireAdminUser();

  const [overview] = await db
    .select({
      usersCount: sql<number>`(select count(*)::int from users)`,
      clicksCount: sql<number>`(select count(*)::int from clicks)`,
      pendingWithdrawalCount: sql<number>`(select count(*)::int from withdrawal_requests where status = 'pending')`,
      totalWalletBalance: sql<number>`coalesce((select sum(balance_in_paise)::int from wallets), 0)`,
    })
    .from(users)
    .limit(1);

  const pendingWithdrawals = await db
    .select({
      id: withdrawalRequests.id,
      amountInPaise: withdrawalRequests.amountInPaise,
      upiId: withdrawalRequests.upiId,
      createdAt: withdrawalRequests.createdAt,
      userEmail: users.email,
      userName: users.name,
    })
    .from(withdrawalRequests)
    .innerJoin(users, eq(users.id, withdrawalRequests.userId))
    .where(eq(withdrawalRequests.status, "pending"))
    .orderBy(desc(withdrawalRequests.createdAt))
    .limit(50);

  const recentClicks = await db
    .select({
      id: clicks.id,
      createdAt: clicks.createdAt,
      userEmail: users.email,
      merchantName: merchants.name,
    })
    .from(clicks)
    .innerJoin(users, eq(users.id, clicks.userId))
    .innerJoin(merchants, eq(merchants.id, clicks.merchantId))
    .orderBy(desc(clicks.createdAt))
    .limit(30);

  const recentWalletTransactions = await db
    .select({
      id: walletTransactions.id,
      type: walletTransactions.type,
      amountInPaise: walletTransactions.amountInPaise,
      createdAt: walletTransactions.createdAt,
      note: walletTransactions.note,
      userEmail: users.email,
    })
    .from(walletTransactions)
    .innerJoin(users, eq(users.id, walletTransactions.userId))
    .orderBy(desc(walletTransactions.createdAt))
    .limit(40);

  const usersWithWallet = await db
    .select({
      email: users.email,
      name: users.name,
      balanceInPaise: wallets.balanceInPaise,
    })
    .from(wallets)
    .innerJoin(users, eq(users.id, wallets.userId))
    .orderBy(desc(wallets.updatedAt))
    .limit(50);

  return (
    <div className="container mx-auto space-y-6 px-4 py-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
        <p className="text-sm text-muted-foreground">
          Manage wallet balances, withdrawal requests, and tracking records.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Total Users</CardDescription>
            <CardTitle>{overview?.usersCount ?? 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Total Clicks</CardDescription>
            <CardTitle>{overview?.clicksCount ?? 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Pending Withdrawals</CardDescription>
            <CardTitle>{overview?.pendingWithdrawalCount ?? 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Total Wallet Liability</CardDescription>
            <CardTitle>{formatPaiseAsINR(overview?.totalWalletBalance ?? 0)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manual Wallet Update</CardTitle>
          <CardDescription>
            Credit or debit a user wallet by email after affiliate commission reconciliation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminWalletAdjustForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pending Withdrawal Requests</CardTitle>
          <CardDescription>
            Approve to debit wallet, reject request, or mark approved items as paid.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {pendingWithdrawals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending requests.</p>
          ) : (
            pendingWithdrawals.map((request) => (
              <div key={request.id} className="rounded-lg border border-border/60 p-4">
                <p className="font-medium">
                  {request.userName ?? "User"} ({request.userEmail})
                </p>
                <p className="text-sm text-muted-foreground">
                  Amount: {formatPaiseAsINR(request.amountInPaise)} | UPI: {request.upiId} | Requested: {formatDate(request.createdAt)}
                </p>
                <form action={adminProcessWithdrawalFormAction} className="mt-3 flex flex-col gap-2 md:flex-row md:items-center">
                  <input type="hidden" name="requestId" value={request.id} />
                  <input
                    name="note"
                    placeholder="Optional admin note"
                    className="h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  <Button type="submit" name="decision" value="approve">Approve</Button>
                  <Button type="submit" name="decision" value="reject" variant="outline">Reject</Button>
                  <Button type="submit" name="decision" value="mark-paid" variant="secondary">Mark Paid</Button>
                </form>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Click Tracking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {recentClicks.map((click) => (
              <div key={click.id} className="rounded-lg border border-border/60 p-3">
                <p className="font-medium">{click.merchantName}</p>
                <p className="text-muted-foreground">
                  {click.userEmail} | {formatDate(click.createdAt)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Wallet Transactions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {recentWalletTransactions.map((tx) => (
              <div key={tx.id} className="rounded-lg border border-border/60 p-3">
                <p className="font-medium">
                  {tx.type.toUpperCase()} {formatPaiseAsINR(tx.amountInPaise)}
                </p>
                <p className="text-muted-foreground">
                  {tx.userEmail} | {formatDate(tx.createdAt)}
                </p>
                {tx.note ? <p className="text-muted-foreground">{tx.note}</p> : null}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Wallet Balances</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {usersWithWallet.map((wallet) => (
            <div key={wallet.email} className="flex items-center justify-between rounded-lg border border-border/60 p-3">
              <span>{wallet.name ?? "User"} ({wallet.email})</span>
              <span className="font-medium">{formatPaiseAsINR(wallet.balanceInPaise)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPage;
