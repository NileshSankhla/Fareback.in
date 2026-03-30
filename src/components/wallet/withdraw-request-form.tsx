"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, Landmark } from "lucide-react";

import {
  createWithdrawalRequestAction,
} from "@/app/actions/wallet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className="h-12 w-full text-base font-bold shadow-[0_0_15px_hsl(var(--primary)/0.2)] transition-all hover:scale-[1.02] hover:shadow-[0_0_25px_hsl(var(--primary)/0.4)]"
      disabled={pending}
    >
      {pending ? (
        "Processing Request..."
      ) : (
        <>
          Request Secure Withdrawal <ArrowRight className="ml-2 h-5 w-5" />
        </>
      )}
    </Button>
  );
};

interface WithdrawRequestFormProps {
  hasPendingRequest: boolean;
}

const WithdrawRequestForm = ({ hasPendingRequest }: WithdrawRequestFormProps) => {
  const [state, formAction] = useActionState(
    createWithdrawalRequestAction,
    {},
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label
          htmlFor="upiId"
          className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground"
        >
          <Landmark className="h-4 w-4" /> Destination UPI ID
        </label>
        <Input
          id="upiId"
          name="upiId"
          placeholder="yourname@okaxis"
          autoComplete="off"
          required
          disabled={hasPendingRequest}
          className="h-12 text-base focus-visible:ring-primary/50"
        />
        {state.fieldErrors?.upiId?.[0] ? (
          <p className="text-sm font-medium text-destructive">{state.fieldErrors.upiId[0]}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="amount"
          className="text-sm font-bold uppercase tracking-wide text-muted-foreground"
        >
          Withdrawal Amount
        </label>
        <div className="relative">
          <span className="absolute left-4 top-3 text-lg font-medium text-muted-foreground">INR</span>
          <Input
            id="amount"
            name="amount"
            placeholder="0.00"
            inputMode="decimal"
            required
            disabled={hasPendingRequest}
            className="h-12 pl-12 text-lg font-semibold focus-visible:ring-primary/50"
          />
        </div>
        {state.fieldErrors?.amount?.[0] ? (
          <p className="text-sm font-medium text-destructive">{state.fieldErrors.amount[0]}</p>
        ) : null}
      </div>

      {hasPendingRequest ? (
        <p className="rounded-lg border border-border/50 bg-secondary/50 p-3 text-center text-sm font-medium text-muted-foreground">
          You have an active withdrawal in progress.
        </p>
      ) : null}

      {state.error ? <p className="text-center text-sm font-medium text-destructive">{state.error}</p> : null}
      {state.success ? (
        <p className="text-center text-sm font-medium text-emerald-600 dark:text-emerald-400">{state.success}</p>
      ) : null}

      <SubmitButton />
    </form>
  );
};

export default WithdrawRequestForm;
