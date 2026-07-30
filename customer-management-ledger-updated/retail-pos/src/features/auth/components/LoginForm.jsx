import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { loginSchema } from "@/features/customers/schemas/loginSchema";
import { login } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginForm() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(loginSchema) });
  const onSubmit = async (data) => {
    const { error, created } = await login(data.email, data.password);
    if (error) { toast.error(error.message); return; }
    toast.success(created ? "Account created and signed in" : "Login successful");
    navigate("/dashboard", { replace: true });
  };
  return (
    <div className="w-full max-w-md">
      <div className="mb-9 lg:hidden"><div className="mb-2 flex size-11 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-lg shadow-blue-200">RP</div><p className="font-bold text-slate-900">Retail Pro</p></div>
      <div className="mb-8"><p className="mb-2 text-sm font-semibold text-blue-600">WELCOME BACK</p><h2 className="text-3xl font-bold text-slate-950">Sign in to your account</h2><p className="mt-3 text-sm leading-6 text-slate-500">Enter your credentials to access your business dashboard.</p></div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div><label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">Email address</label><div className="relative"><Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input id="email" type="email" autoComplete="email" placeholder="admin@example.com" className="h-12 rounded-md border-slate-200 bg-slate-50/60 pl-10 pr-4 focus-visible:bg-white" {...register("email")} /></div>{errors.email && <p className="mt-1.5 text-sm text-red-500">{errors.email.message}</p>}</div>
        <div><label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">Password</label><div className="relative"><LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input id="password" type="password" autoComplete="current-password" placeholder="Enter your password" className="h-12 rounded-md border-slate-200 bg-slate-50/60 pl-10 pr-4 focus-visible:bg-white" {...register("password")} /></div>{errors.password && <p className="mt-1.5 text-sm text-red-500">{errors.password.message}</p>}</div>
        <Button className="h-12 w-full rounded-md bg-blue-600 text-base text-white shadow-lg shadow-blue-200 transition duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl" type="submit">Sign in <ArrowRight className="ml-1 size-4 transition-transform duration-300 group-hover/button:translate-x-1" /></Button>
      </form>
      <p className="mt-8 text-center text-xs text-slate-400">Protected by secure encrypted authentication</p>
    </div>
  );
}
