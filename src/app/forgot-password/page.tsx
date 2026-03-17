import type { Metadata } from "next";
import Link from "next/link";

import ForgotPasswordForm from "@/components/auth/forgot-password-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
          Enter your account email to generate a reset link.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ForgotPasswordForm />
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
