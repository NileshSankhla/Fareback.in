import type { Metadata } from "next";
import Link from "next/link";

import ResetPasswordForm from "@/components/auth/reset-password-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Set a new account password.",
};

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

const ResetPasswordPage = async ({ searchParams }: ResetPasswordPageProps) => {
  const params = await searchParams;
  const token = params.token?.trim() ?? "";

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Set a new password</CardTitle>
          <CardDescription>
            Use the link from your email or console output to set your new password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {token ? (
            <ResetPasswordForm token={token} />
          ) : (
            <p className="text-sm text-destructive">
              Missing or invalid reset token. Request a new reset link.
            </p>
          )}

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
};

export default ResetPasswordPage;
