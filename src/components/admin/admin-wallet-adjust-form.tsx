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
    <Button type="submit" disabled={pending}>
      {pending ? "Updating..." : "Update Wallet"}
    </Button>
  );
};

const AdminWalletAdjustForm = () => {
  const [state, formAction] = useActionState(
    adminAdjustWalletAction,
    {},
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Input
          name="userEmail"
          placeholder="user@example.com"
          required
          className="md:col-span-2"
        />
        <select
          name="type"
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          defaultValue="credit"
        >
          <option value="credit">Credit</option>
          <option value="debit">Debit</option>
        </select>
        <Input name="amount" placeholder="100.00" required inputMode="decimal" />
      </div>

      <Input name="note" placeholder="Optional note" maxLength={250} />

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-green-600">{state.success}</p> : null}

      <SubmitButton />
    </form>
  );
};

export default AdminWalletAdjustForm;
