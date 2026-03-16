import type { Metadata } from "next";

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

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your account.",
};

const DashboardPage = async () => {
  const user = await requireUser();

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
            </dl>

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
