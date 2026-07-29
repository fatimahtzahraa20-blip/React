import { BookOpenCheck, ShieldCheck, Users } from "lucide-react";
import { Navigate, Outlet } from "react-router-dom";
import { useInstituteSettings } from "@/features/shared/hooks/useInstituteSettings";
import { isSupabaseConfigured } from "@/lib/supabase";

export function AuthLayout() {
  const { name: instituteName, logoUrl } = useInstituteSettings();
  if (!isSupabaseConfigured) return <Navigate to="/setup-required" replace />;
  return (
    <main className="auth-layout">
      <section className="auth-visual">
        <div className="auth-brand">{logoUrl ? <img src={logoUrl} alt={instituteName} /> : <span>{instituteName.charAt(0).toUpperCase()}</span>}<strong>{instituteName}</strong></div>
        <div className="auth-copy">
          <span className="eyebrow">SCHOOL OPERATIONS, SIMPLIFIED</span>
          <h1>One place for every class, assignment and student.</h1>
          <p>Securely manage learning and attendance across your institute.</p>
          <div className="auth-points">
            <div><BookOpenCheck /><span><strong>Assignment workflows</strong><small>Publish, submit and review in one place</small></span></div>
            <div><Users /><span><strong>Role-based workspaces</strong><small>Purpose-built access for your whole institute</small></span></div>
            <div><ShieldCheck /><span><strong>Privacy by design</strong><small>Supabase Row Level Security on every record</small></span></div>
          </div>
        </div>
        <small>© {new Date().getFullYear()} {instituteName}</small>
      </section>
      <section className="auth-form-wrap"><Outlet /></section>
    </main>
  );
}
