import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(8, "Password must contain at least 8 characters"),
});
export const signupSchema = loginSchema.extend({
  fullName: z.string().trim().min(2, "Enter your full name").max(100),
  confirmPassword: z.string().min(8),
}).refine((data) => data.password === data.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });
export const forgotPasswordSchema = z.object({ email: z.email("Enter a valid email address") });
export const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must contain at least 8 characters"),
  confirmPassword: z.string().min(8),
}).refine((data) => data.password === data.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

export type LoginForm = z.infer<typeof loginSchema>;
export type SignupForm = z.infer<typeof signupSchema>;
export type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;
