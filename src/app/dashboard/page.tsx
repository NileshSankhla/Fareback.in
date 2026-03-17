import type { Metadata } from "next";
import { desc, eq, sql } from "drizzle-orm";

import { signOutAction } from "@/app/actions/auth";
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
import { clicks, merchants } from "@/lib/db/schema";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your account.",
};

const DashboardPage = async () => {
  const user = await requireUser();

  const [clickSummary] = await db
    .select({
      totalClicks: sql<number>`count(*)::int`,
    })
    .from(clicks)
    .where(eq(clicks.userId, user.id));

  const recentClicks = await db
    .select({
      clickId: clicks.id,
      merchantName: merchants.name,
      createdAt: clicks.createdAt,
    })
    .from(clicks)
    .innerJoin(merchants, eq(merchants.id, clicks.merchantId))
    .where(eq(clicks.userId, user.id))
    .orderBy(desc(clicks.createdAt))
    .limit(10);

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
                <dt className="text-muted-foreground">Total tracked clicks</dt>
                <dd className="mt-1 font-medium">{clickSummary?.totalClicks ?? 0}</dd>
              </div>
            </dl>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Recent Click Activity</h3>
              {recentClicks.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No clicks tracked yet. Use the merchant links on the homepage.
                </p>
              ) : (
                <div className="space-y-2">
                  {recentClicks.map((click) => (
                    <div
                      key={click.clickId}
                      className="flex items-center justify-between rounded-lg border border-border/60 p-3 text-sm"
                    >
                      <span className="font-medium">{click.merchantName}</span>
                      <span className="text-muted-foreground">
                        {click.createdAt.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
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
