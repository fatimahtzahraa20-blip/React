import { LogOut, Monitor, Moon, ShieldCheck, Sun } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { logout } from "@/services/authService";
import useAuthStore from "@/store/authStore";
import useTheme from "@/hooks/useTheme";
import QuickAccess from "./QuickAccess";
import NotificationBell from "@/features/notifications/components/NotificationBell";

const themes = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export default function Header() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const clearAuth = useAuthStore((state) => state.logout);
  const { theme, setTheme } = useTheme();
  const title = pathname === "/dashboard" ? "Dashboard" : pathname.split("/").filter(Boolean).pop()?.replaceAll("-", " ") || "Dashboard";
  const handleLogout = async () => {
    const { error } = await logout();
    if (error) { toast.error(error.message); return; }
    clearAuth();
    navigate("/login", { replace: true });
  };
  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-800 bg-[#101d2d]/95 px-4 text-white shadow-lg shadow-slate-950/10 backdrop-blur-xl sm:px-6 lg:px-8">
      <div><p className="text-xs font-medium text-slate-400">Retail Pro / Workspace</p><h2 className="mt-0.5 text-lg font-bold capitalize text-white">{title}</h2></div>
      <div className="flex items-center gap-2 sm:gap-3">
        <QuickAccess />
        <div className="hidden h-10 items-center rounded-md border border-white/10 bg-white/5 p-1 lg:flex" aria-label="Color theme">
          {themes.map(({ value, label, icon: Icon }) => <button key={value} type="button" onClick={() => setTheme(value)} title={`${label} theme`} className={`flex size-8 items-center justify-center rounded transition-all duration-200 ${theme === value ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-white"}`}><Icon className="size-4" /></button>)}
        </div>
        <button type="button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} title="Change theme" className="flex size-10 items-center justify-center rounded-md border border-white/10 bg-white/5 text-slate-300 transition-all hover:-translate-y-0.5 hover:bg-white/10 hover:text-white lg:hidden">{theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}</button>
        <NotificationBell />
        <div className="flex h-11 items-center rounded-md border border-white/10 bg-white/5 p-1 shadow-sm">
          <div className="flex items-center gap-2 px-2 sm:px-3"><div className="flex size-7 items-center justify-center rounded-md bg-[#101d2d] text-white"><ShieldCheck className="size-4" /></div><div className="hidden text-left sm:block"><p className="text-xs font-bold leading-4 text-white">Admin</p><p className="text-[10px] leading-3 text-slate-400">Administrator</p></div></div>
          <div className="mx-1 h-6 w-px bg-white/10" />
          <button type="button" onClick={handleLogout} title="Log out" className="group/logout flex h-8 items-center gap-2 rounded px-2 text-xs font-semibold text-slate-300 transition-all duration-300 hover:bg-red-500/15 hover:text-red-300 sm:px-3"><LogOut className="size-4 transition-transform duration-300 group-hover/logout:translate-x-0.5" /><span className="hidden sm:inline">Logout</span></button>
        </div>
      </div>
    </header>
  );
}



