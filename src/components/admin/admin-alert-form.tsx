"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { adminSendAlertAction } from "@/app/actions/notifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AdminAlertFormProps {
  userEmailSuggestions: string[];
}

const SubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Sending..." : "Send Alert"}
    </Button>
  );
};

const AdminAlertForm = ({ userEmailSuggestions }: AdminAlertFormProps) => {
  const [state, formAction] = useActionState(adminSendAlertAction, {});

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <select
          name="recipientType"
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          defaultValue="all"
        >
          <option value="all">All users</option>
          <option value="single">Single user (email)</option>
        </select>
        <Input
          name="userEmail"
          placeholder="user@example.com (for single user)"
          list="admin-alert-email-suggestions"
          autoComplete="off"
          className="md:col-span-2"
        />
        <datalist id="admin-alert-email-suggestions">
          {userEmailSuggestions.map((email) => (
            <option key={email} value={email} />
          ))}
        </datalist>
      </div>

      <textarea
        name="message"
        placeholder="Write alert message for users"
        required
        maxLength={300}
        className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      />

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-green-600">{state.success}</p> : null}

      <SubmitButton />
    </form>
  );
};

export default AdminAlertForm;
