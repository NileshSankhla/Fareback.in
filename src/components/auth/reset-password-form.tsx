"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { resetPasswordAction, type AuthActionState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: AuthActionState = {};

interface ResetPasswordFormProps {
  token: string;
}

const SubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Resetting password..." : "Reset Password"}
    </Button>
  );
};

const ResetPasswordForm = ({ token }: ResetPasswordFormProps) => {
  const [state, formAction] = useActionState(resetPasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium leading-none">
          New Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Min. 8 characters"
          autoComplete="new-password"
          required
        />
        {state.fieldErrors?.password?.[0] ? (
          <p className="text-sm text-destructive">{state.fieldErrors.password[0]}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="confirmPassword"
          className="text-sm font-medium leading-none"
        >
          Confirm New Password
        </label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          required
        />
        {state.fieldErrors?.confirmPassword?.[0] ? (
          <p className="text-sm text-destructive">
            {state.fieldErrors.confirmPassword[0]}
          </p>
        ) : null}
      </div>

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-green-600">{state.success}</p> : null}

      <SubmitButton />
    </form>
  );
};

export default ResetPasswordForm;
