import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
});

export const signUpSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "Name must be at least 2 characters." })
      .max(50, { message: "Name must be at most 50 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter.",
      })
      .regex(/[0-9]/, { message: "Password must contain at least one number." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, { message: "Reset token is required." }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter.",
      })
      .regex(/[0-9]/, { message: "Password must contain at least one number." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const walletAdjustmentSchema = z.object({
  userEmail: z.string().email({ message: "Please enter a valid user email." }),
  type: z.enum(["credit", "debit"]),
  amount: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, {
      message: "Enter a valid amount with up to 2 decimal places.",
    }),
  note: z.string().trim().max(250).optional(),
});

export const withdrawalRequestSchema = z.object({
  upiId: z
    .string()
    .trim()
    .min(5, { message: "UPI ID is required." })
    .max(100, { message: "UPI ID is too long." })
    .regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/, {
      message: "Please enter a valid UPI ID.",
    }),
  amount: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, {
      message: "Enter a valid amount with up to 2 decimal places.",
    }),
});

export const adminWithdrawalDecisionSchema = z.object({
  requestId: z.string().trim().regex(/^\d+$/, {
    message: "Invalid request ID.",
  }),
  decision: z.enum(["approve", "reject", "mark-paid"]),
  note: z.string().trim().max(250).optional(),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type WalletAdjustmentInput = z.infer<typeof walletAdjustmentSchema>;
export type WithdrawalRequestInput = z.infer<typeof withdrawalRequestSchema>;
export type AdminWithdrawalDecisionInput = z.infer<
  typeof adminWithdrawalDecisionSchema
>;
