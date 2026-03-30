"use client";

import { useMemo, useState } from "react";

import {
  adminApproveClickFormAction,
  adminDeleteUnreviewedClickFormAction,
  adminMarkClickTrackedFormAction,
  adminPermanentlyDeleteAllDeletedClicksFormAction,
  adminRestoreDeletedClickFormAction,
  adminUndoApprovedClickFormAction,
  adminUndoTrackedClickFormAction,
} from "@/app/actions/wallet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate, formatPaiseAsINR } from "@/lib/utils";

type ClickStatus = "unreviewed" | "tracked" | "approved" | "deleted";

interface AdminClickItem {
  id: string;
  createdAt: string;
  userEmail: string;
  merchantName: string;
  trackingStatus: ClickStatus;
  rewardAmountInPaise: number;
  affiliateLinkIndex: number | null;
}

interface WalletUserItem {
  email: string;
  name: string | null;
  balanceInPaise: number;
}

interface AdminInteractiveSectionsProps {
  usersCount: number;
  clicksCount: number;
  unreviewedClicksCount: number;
  trackedClicksCount: number;
  clicks: AdminClickItem[];
  usersWithWallet: WalletUserItem[];
}

const clickStatusLabel: Record<ClickStatus, string> = {
  unreviewed: "Unreviewed",
  tracked: "Tracked",
  approved: "Approved",
  deleted: "Deleted",
};

const AdminInteractiveSections = ({
  usersCount,
  clicksCount,
  unreviewedClicksCount,
  trackedClicksCount,
  clicks,
  usersWithWallet,
}: AdminInteractiveSectionsProps) => {
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userSort, setUserSort] = useState<"latest" | "name-asc" | "name-desc" | "wallet-asc" | "wallet-desc">("latest");

  const [showAllClicks, setShowAllClicks] = useState(false);
  const [clickFilter, setClickFilter] = useState<"all" | ClickStatus>("all");

  const filteredUsers = useMemo(() => {
    const normalizedQuery = userSearch.trim().toLowerCase();

    const base = normalizedQuery
      ? usersWithWallet.filter((user) => {
          const name = (user.name ?? "").toLowerCase();
          const email = user.email.toLowerCase();
          return name.includes(normalizedQuery) || email.includes(normalizedQuery);
        })
      : [...usersWithWallet];

    if (userSort === "name-asc") {
      return base.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
    }

    if (userSort === "name-desc") {
      return base.sort((a, b) => (b.name ?? "").localeCompare(a.name ?? ""));
    }

    if (userSort === "wallet-asc") {
      return base.sort((a, b) => a.balanceInPaise - b.balanceInPaise);
    }

    if (userSort === "wallet-desc") {
      return base.sort((a, b) => b.balanceInPaise - a.balanceInPaise);
    }

    return base;
  }, [userSearch, userSort, usersWithWallet]);

  const visibleUsers = showAllUsers ? filteredUsers : filteredUsers.slice(0, 10);

  const filteredClicks = useMemo(() => {
    if (clickFilter === "all") {
      return clicks.filter((click) => click.trackingStatus !== "deleted");
    }

    return clicks.filter((click) => click.trackingStatus === clickFilter);
  }, [clickFilter, clicks]);

  const visibleClicks = showAllClicks ? filteredClicks : filteredClicks.slice(0, 10);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Wallet Balances</CardTitle>
          <CardDescription>
            Total users: {usersCount}. Search by name or email and sort when viewing full list.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Input
              value={userSearch}
              onChange={(event) => setUserSearch(event.target.value)}
              placeholder="Search user by name or email"
            />
            <select
              value={userSort}
              onChange={(event) => setUserSort(event.target.value as typeof userSort)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="latest">Latest updated</option>
              <option value="name-asc">Name A to Z</option>
              <option value="name-desc">Name Z to A</option>
              <option value="wallet-asc">Wallet low to high</option>
              <option value="wallet-desc">Wallet high to low</option>
            </select>
          </div>

          {visibleUsers.length === 0 ? (
            <p className="text-muted-foreground">No users found.</p>
          ) : (
            visibleUsers.map((wallet) => (
              <div key={wallet.email} className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                <span>
                  {wallet.name ?? "User"} ({wallet.email})
                </span>
                <span className="font-medium">{formatPaiseAsINR(wallet.balanceInPaise)}</span>
              </div>
            ))
          )}

          {filteredUsers.length > 10 ? (
            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAllUsers((prev) => !prev)}
              >
                {showAllUsers ? "Collapse users" : "Expand all users"}
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card id="recent-click-tracking">
        <CardHeader>
          <CardTitle>Recent Click Tracking</CardTitle>
          <CardDescription>
            Total clicks: {clicksCount} | Unreviewed: {unreviewedClicksCount} | Tracked: {trackedClicksCount}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <select
              value={clickFilter}
              onChange={(event) => setClickFilter(event.target.value as typeof clickFilter)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm md:w-64"
            >
              <option value="all">Without sorting (all)</option>
              <option value="tracked">Tracked only</option>
              <option value="approved">Approved only</option>
              <option value="unreviewed">Unreviewed only</option>
              <option value="deleted">Deleted only</option>
            </select>

            {clickFilter === "deleted" ? (
              <form action={adminPermanentlyDeleteAllDeletedClicksFormAction}>
                <Button type="submit" size="sm" variant="destructive">
                  Permanently Delete All Deleted Entries
                </Button>
              </form>
            ) : null}
          </div>

          {visibleClicks.length === 0 ? (
            <p className="text-muted-foreground">No click records for this filter.</p>
          ) : (
            visibleClicks.map((click) => (
              <div key={click.id} className="rounded-lg border border-border/60 p-3 space-y-2">
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                  <p className="font-medium">{click.merchantName}</p>
                  <span className="text-xs rounded-full border border-border/70 px-2 py-1 w-fit">
                    {clickStatusLabel[click.trackingStatus]}
                  </span>
                </div>
                <p className="text-muted-foreground">
                  {click.userEmail} | {formatDate(new Date(click.createdAt))}
                </p>
                {click.affiliateLinkIndex !== null && click.merchantName === "Amazon" ? (
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    Affiliate Link Number: {click.affiliateLinkIndex + 1}
                  </p>
                ) : null}
                {click.trackingStatus === "approved" ? (
                  <p className="text-muted-foreground">
                    Reward credited: {formatPaiseAsINR(click.rewardAmountInPaise)}
                  </p>
                ) : null}

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {click.trackingStatus === "unreviewed" ? (
                    <form action={adminMarkClickTrackedFormAction}>
                      <input type="hidden" name="clickId" value={click.id} />
                      <Button type="submit" variant="outline" size="sm">Tracked</Button>
                    </form>
                  ) : null}

                  {click.trackingStatus === "unreviewed" ? (
                    <form action={adminDeleteUnreviewedClickFormAction}>
                      <input type="hidden" name="clickId" value={click.id} />
                      <Button type="submit" variant="destructive" size="sm">Delete Entry</Button>
                    </form>
                  ) : null}

                  {click.trackingStatus === "deleted" ? (
                    <form action={adminRestoreDeletedClickFormAction}>
                      <input type="hidden" name="clickId" value={click.id} />
                      <Button type="submit" variant="outline" size="sm">Restore Entry</Button>
                    </form>
                  ) : null}

                  {click.trackingStatus === "tracked" ? (
                    <form action={adminUndoTrackedClickFormAction}>
                      <input type="hidden" name="clickId" value={click.id} />
                      <Button type="submit" variant="ghost" size="sm">Undo tracked</Button>
                    </form>
                  ) : null}

                  {click.trackingStatus === "unreviewed" || click.trackingStatus === "tracked" ? (
                    <form action={adminApproveClickFormAction} className="flex items-center gap-2">
                      <input type="hidden" name="clickId" value={click.id} />
                      <Input
                        name="amount"
                        placeholder="Amount INR"
                        inputMode="decimal"
                        required
                        className="h-9 w-32"
                      />
                      <Button type="submit" size="sm">Approve</Button>
                    </form>
                  ) : (
                    <form action={adminUndoApprovedClickFormAction}>
                      <input type="hidden" name="clickId" value={click.id} />
                      <Button type="submit" variant="ghost" size="sm">Undo approved</Button>
                    </form>
                  )}
                </div>
              </div>
            ))
          )}

          {filteredClicks.length > 10 ? (
            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAllClicks((prev) => !prev)}
              >
                {showAllClicks ? "Collapse clicks" : "Expand all clicks"}
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminInteractiveSections;
