import type { Metadata } from "next";
import Link from "next/link";
import SignInForm from "@/components/auth/sign-in-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your account.",
};

interface SignInPageProps {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}

const SignInPage = async ({ searchParams }: SignInPageProps) => {
  const params = await searchParams;
  const redirectTo = params.redirect?.trim() || "/dashboard";
  const googleError = params.error?.trim() || null;

  return (
  <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Sign in to your account to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <SignInForm redirectTo={redirectTo} googleError={googleError} />
        <div className="mt-4 text-right">
          <Link
            href="/forgot-password"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Forgot password?
          </Link>
        </div>
      </CardContent>
      <CardFooter className="justify-center text-sm text-muted-foreground">
        Don&apos;t have an account?&nbsp;
        <Link href="/sign-up" className="text-primary hover:underline">
          Sign up
        </Link>
      </CardFooter>
    </Card>
  </div>
  );
};

export default SignInPage;
