import type { Metadata } from "next";
import SignInForm from "@/components/auth/sign-in-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Continue with Google",
  description: "Sign in or sign up using your Google account.",
};

interface SignInPageProps {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}

const SignInPage = async ({ searchParams }: SignInPageProps) => {
  const params = await searchParams;
  const redirectTo = params.redirect?.trim() || "/";
  const googleError = params.error?.trim() || null;

  return (
  <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Continue with Google</CardTitle>
        <CardDescription>
          One click sign-in and sign-up with your Google account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignInForm redirectTo={redirectTo} googleError={googleError} />
      </CardContent>
    </Card>
  </div>
  );
};

export default SignInPage;
