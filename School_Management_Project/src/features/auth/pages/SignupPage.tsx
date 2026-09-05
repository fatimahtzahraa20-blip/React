import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { signUp } from "../api/auth.api";
import { signupSchema, type SignupForm } from "../schemas/auth.schema";

export function SignupPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<SignupForm>({ resolver: zodResolver(signupSchema) });
  async function submit(values: SignupForm) {
    try {
      await signUp({ fullName: values.fullName, email: values.email, password: values.password });
      reset(); toast.success("Account created. Check your email to confirm your account.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to create account"); }
  }
  return <div className="auth-card">
    <span className="auth-kicker">GET STARTED</span><h2>Create your account</h2><p>Your administrator can update your role after signup.</p>
    <form onSubmit={handleSubmit(submit)} className="auth-form">
      <label>Full name<input {...register("fullName")} autoComplete="name" placeholder="Your full name" />{errors.fullName && <small>{errors.fullName.message}</small>}</label>
      <label>Email address<input {...register("email")} type="email" autoComplete="email" placeholder="you@institute.edu" />{errors.email && <small>{errors.email.message}</small>}</label>
      <div className="auth-form-grid"><label>Password<input {...register("password")} type="password" autoComplete="new-password" />{errors.password && <small>{errors.password.message}</small>}</label><label>Confirm password<input {...register("confirmPassword")} type="password" autoComplete="new-password" />{errors.confirmPassword && <small>{errors.confirmPassword.message}</small>}</label></div>
      <Button type="submit" disabled={isSubmitting}>{isSubmitting && <LoaderCircle className="spin" />} Create account</Button>
    </form>
    <footer>Already have an account? <Link to="/login">Sign in</Link></footer>
  </div>;
}
