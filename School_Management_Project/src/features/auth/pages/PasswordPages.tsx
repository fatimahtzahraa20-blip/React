import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { requestPasswordReset, updatePassword } from "../api/auth.api";
import { forgotPasswordSchema, resetPasswordSchema, type ForgotPasswordForm, type ResetPasswordForm } from "../schemas/auth.schema";

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordForm>({ resolver: zodResolver(forgotPasswordSchema) });
  async function submit(values: ForgotPasswordForm) {
    try { await requestPasswordReset(values.email); setSent(true); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Unable to send reset email"); }
  }
  if (sent) return <div className="auth-card auth-success"><CheckCircle2 /><h2>Check your inbox</h2><p>If an account exists for that email, a secure reset link is on its way.</p><Link to="/login"><Button variant="secondary"><ArrowLeft /> Back to sign in</Button></Link></div>;
  return <div className="auth-card"><span className="auth-kicker">ACCOUNT RECOVERY</span><h2>Forgot your password?</h2><p>We’ll email you a secure link to choose a new one.</p><form className="auth-form" onSubmit={handleSubmit(submit)}><label>Email address<input {...register("email")} type="email" autoComplete="email" />{errors.email && <small>{errors.email.message}</small>}</label><Button disabled={isSubmitting}>{isSubmitting && <LoaderCircle className="spin" />} Send reset link</Button></form><footer><Link to="/login">Back to sign in</Link></footer></div>;
}

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordForm>({ resolver: zodResolver(resetPasswordSchema) });
  async function submit(values: ResetPasswordForm) {
    try { await updatePassword(values.password); toast.success("Password updated"); navigate("/", { replace: true }); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Unable to update password"); }
  }
  return <div className="auth-card"><span className="auth-kicker">SECURE YOUR ACCOUNT</span><h2>Choose a new password</h2><p>Use at least eight characters.</p><form className="auth-form" onSubmit={handleSubmit(submit)}><label>New password<input {...register("password")} type="password" autoComplete="new-password" />{errors.password && <small>{errors.password.message}</small>}</label><label>Confirm password<input {...register("confirmPassword")} type="password" autoComplete="new-password" />{errors.confirmPassword && <small>{errors.confirmPassword.message}</small>}</label><Button disabled={isSubmitting}>{isSubmitting && <LoaderCircle className="spin" />} Update password</Button></form></div>;
}
