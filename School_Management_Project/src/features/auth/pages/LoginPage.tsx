import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { useInstituteSettings } from "@/features/shared/hooks/useInstituteSettings";
import { useAuthStore } from "@/store/authStore";
import { getAuthUser, signIn, signOut } from "../api/auth.api";
import { loginSchema, type LoginForm } from "../schemas/auth.schema";

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { name: instituteName } = useInstituteSettings();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  async function submit(values: LoginForm) {
    try {
      const { user } = await signIn(values);
      if (!user) throw new Error("Supabase did not return an authenticated user.");

      try {
        const { profile, roles } = await getAuthUser(user.id);
        if (!profile.is_active) throw new Error("Your account has been deactivated. Contact an administrator.");
        if (!roles.length) throw new Error("Your account does not have an assigned role.");
        setAuth(user, profile, roles);
      } catch (profileError) {
        await signOut();
        throw new Error(
          profileError instanceof Error
            ? `Account setup is incomplete: ${profileError.message}`
            : "Account setup is incomplete. Apply the Supabase schema and try again.",
        );
      }

      toast.success("Welcome back");
      navigate((location.state as { from?: string } | null)?.from ?? "/", { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign in");
    }
  }

  return <div className="auth-card">
    <span className="auth-kicker">WELCOME BACK</span><h2>Sign in to {instituteName}</h2><p>Enter your institute account details.</p>
    <form onSubmit={handleSubmit(submit)} className="auth-form">
      <label>Email address<input {...register("email")} type="email" autoComplete="email" placeholder="you@institute.edu" />{errors.email && <small>{errors.email.message}</small>}</label>
      <label>Password<div className="password-field"><input {...register("password")} type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="At least 8 characters" /><button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff /> : <Eye />}</button></div>{errors.password && <small>{errors.password.message}</small>}</label>
      <div className="auth-row"><label className="checkbox-label"><input type="checkbox" /> Remember me</label><Link to="/forgot-password">Forgot password?</Link></div>
      <Button type="submit" disabled={isSubmitting}>{isSubmitting && <LoaderCircle className="spin" />} Sign in</Button>
    </form>
    <footer>New to {instituteName}? <Link to="/signup">Create an account</Link></footer>
  </div>;
}
