"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  adminAdjustWalletAction,
} from "@/app/actions/wallet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? "Processing..." : "Execute Adjustment"}
    </Button>
  );
};

interface AdminWalletAdjustFormProps {
  userEmailSuggestions: string[];
}

const AdminWalletAdjustForm = ({ userEmailSuggestions }: AdminWalletAdjustFormProps) => {
  const [state, formAction] = useActionState(
    adminAdjustWalletAction,
    {},
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <Input
            name="userEmail"
            placeholder="Target User Email"
            required
            list="admin-user-email-suggestions"
            autoComplete="off"
            className="w-full focus-visible:ring-1"
          />
          <datalist id="admin-user-email-suggestions">
            {userEmailSuggestions.map((email) => (
              <option key={email} value={email} />
            ))}
          </datalist>
        </div>

        <div className="flex gap-3 sm:w-[280px]">
          <select
            name="type"
            className="h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
            defaultValue="credit"
          >
            <option value="credit">Credit (+)</option>
            <option value="debit">Debit (-)</option>
          </select>
          <div className="relative flex-1">
            <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">INR</span>
            <Input
              name="amount"
              placeholder="0.00"
              required
              inputMode="decimal"
              className="w-full pl-10 focus-visible:ring-1"
            />
          </div>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <div className="flex-1 text-sm">
          {state.error ? <p className="font-medium text-destructive">{state.error}</p> : null}
          {state.success ? <p className="font-medium text-emerald-600">{state.success}</p> : null}
        </div>
        <SubmitButton />
      </div>
    </form>
  );
};

export default AdminWalletAdjustForm;
