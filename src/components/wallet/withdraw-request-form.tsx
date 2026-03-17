"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  createWithdrawalRequestAction,
} from "@/app/actions/wallet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Submitting request..." : "Request Withdrawal"}
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
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="upiId" className="text-sm font-medium leading-none">
          UPI ID
        </label>
        <Input
          id="upiId"
          name="upiId"
          placeholder="yourname@upi"
          autoComplete="off"
          required
          disabled={hasPendingRequest}
        />
        {state.fieldErrors?.upiId?.[0] ? (
          <p className="text-sm text-destructive">{state.fieldErrors.upiId[0]}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="amount" className="text-sm font-medium leading-none">
          Withdrawal Amount (INR)
        </label>
        <Input
          id="amount"
          name="amount"
          placeholder="100.00"
          inputMode="decimal"
          required
          disabled={hasPendingRequest}
        />
        {state.fieldErrors?.amount?.[0] ? (
          <p className="text-sm text-destructive">{state.fieldErrors.amount[0]}</p>
        ) : null}
      </div>

      {hasPendingRequest ? (
        <p className="text-sm text-muted-foreground">
          You already have a pending withdrawal request. Please wait for admin review.
        </p>
      ) : null}

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-green-600">{state.success}</p> : null}

      <SubmitButton />
    </form>
  );
};

export default WithdrawRequestForm;
