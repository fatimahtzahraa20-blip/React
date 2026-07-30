import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { loginSchema } from "@/features/customers/schemas/loginSchema";
import { login } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";

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
      <div className="mb-9 lg:hidden"><div className="mb-2 flex size-11 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-lg shadow-blue-200">RP</div><p className="fon[...]
      <div className="mb-8"><p className="mb-2 text-sm font-semibold text-blue-600">WELCOME BACK</p><h2 className="text-3xl font-bold text-slate-950">Sign in to your account</h2><p className="mt-3[...]
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div><label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">Email address</label><div className="relative"><Mail className="pointer-events-none absolute left-3.[...]
        <div><label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">Password</label><div className="relative"><LockKeyhole className="pointer-events-none absolute le[...]
        <Button className="h-12 w-full rounded-md bg-blue-600 text-base text-white shadow-lg shadow-blue-200 transition duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl" type=[...]
      </form>
      <p className="mt-8 text-center text-xs text-slate-400">Protected by secure encrypted authentication</p>
    </div>
  );
}
