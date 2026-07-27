import {
  Bell,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Moon,
  Mail,
  PlusCircle,
  ShieldCheck,
  ScrollText,
  Sun,
  UserRound,
  Video,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

type NavigationItem = { label: string; to: string; icon: typeof Video };

export default function DashboardSidebar() {
  const { profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const navigation: NavigationItem[] = [
    { label: "Overview", to: "/admin", icon: LayoutDashboard },
    { label: "Videos", to: "/admin/videos", icon: Video },
    { label: "Add video", to: "/admin/add-video", icon: PlusCircle },
    { label: "Categories", to: "/admin/categories", icon: FolderKanban },
    { label: "Messages", to: "/admin/messages", icon: Mail },
    { label: "Notifications", to: "/admin/notifications", icon: Bell },
    { label: "Activity logs", to: "/admin/activity-logs", icon: ScrollText },
  ];

  const handleLogout = async () => { await signOut(); navigate("/", { replace: true }); };

  return (
    <aside className="dashboard-sidebar flex min-h-screen w-72 flex-col p-5 text-white">
      <NavLink to="/" className="mb-9 flex items-center gap-3 px-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 font-black shadow-lg shadow-purple-500/30">FZ</span>
        <span><strong className="block text-lg tracking-tight">EditStudio</strong><small className="text-xs text-zinc-400">Creative workspace</small></span>
      </NavLink>
      <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-purple-300">Owner workspace</p>
        <p className="mt-1 truncate text-sm text-zinc-300">{profile?.full_name || profile?.email || "Signed in"}</p>
      </div>
      <nav className="flex-1 space-y-1.5" aria-label="Dashboard navigation">
        {navigation.map((item) => { const Icon = item.icon; return <NavLink key={item.to} to={item.to} end={item.to === "/admin"} className={({ isActive }) => `dashboard-nav-link ${isActive ? "dashboard-nav-link-active" : ""}`}><Icon size={19} strokeWidth={2.2} />{item.label}</NavLink>; })}
      </nav>
      <div className="mt-6 border-t border-white/10 pt-5">
        <div className="mb-4 flex items-center gap-2 px-3 text-xs text-zinc-400"><ShieldCheck size={15} className="text-emerald-400" />Data synced with Supabase</div>
        <button type="button" onClick={toggleTheme} className="dashboard-theme-toggle mb-2" aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}>
          {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
          {theme === "dark" ? "Light theme" : "Dark theme"}
        </button>
        <button type="button" onClick={() => void handleLogout()} className="dashboard-logout"><LogOut size={19} />Logout &amp; go home</button>
      </div>
    </aside>
  );
}

