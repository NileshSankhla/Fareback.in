import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your account password.",
};

const ForgotPasswordPage = () => (
  <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Reset password</CardTitle>
        <CardDescription>
          Password reset flow is scaffolded. Plug in your mail provider to send
          reset links.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium leading-none">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>
        <Button type="button" className="w-full" disabled>
          Send Reset Link (Coming Soon)
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Return to{" "}
          <Link href="/sign-in" className="text-primary hover:underline">
            sign in
          </Link>
          .
        </p>
      </CardContent>
    </Card>
  </div>
);

export default ForgotPasswordPage;
