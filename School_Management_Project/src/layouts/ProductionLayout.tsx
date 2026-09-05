import {
  BarChart3, Bell, BookOpen, CalendarCheck, ChevronDown, ClipboardList, GraduationCap,
  LayoutDashboard, LogOut, Menu, Moon, Search, Settings, Sun, UserRound, Users, X,
} from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useInstituteSettings } from "@/features/shared/hooks/useInstituteSettings";
import { initials } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";

const navigation = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, roles: ["super_admin", "admin", "teacher", "student"] },
  { label: "My profile", href: "/profile", icon: UserRound, roles: ["student"] },
  { label: "Students", href: "/students", icon: GraduationCap, roles: ["super_admin", "admin", "teacher"] },
  { label: "Teachers", href: "/teachers", icon: Users, roles: ["super_admin", "admin"] },
  { label: "Courses", href: "/courses", icon: BookOpen, roles: ["super_admin", "admin"] },
  { label: "Batches", href: "/batches", icon: Users, roles: ["super_admin", "admin", "teacher"] },
  { label: "Assignments", href: "/assignments", icon: ClipboardList, roles: ["super_admin", "admin", "teacher", "student"] },
  { label: "Attendance", href: "/attendance", icon: CalendarCheck, roles: ["super_admin", "admin", "teacher", "student"] },
  { label: "Users & roles", href: "/users", icon: Users, roles: ["super_admin", "admin"] },
  { label: "Reports", href: "/reports", icon: BarChart3, roles: ["super_admin", "admin"] },
] as const;
const pageNames: Record<string, string> = Object.fromEntries(navigation.map((item) => [item.href, item.label]));
Object.assign(pageNames, { "/notifications": "Notifications", "/settings": "Settings" });

export function ProductionLayout() {
  const { sidebarOpen, toggleSidebar, closeSidebar } = useUIStore();
  const { profile, roles, logout } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const { name: instituteName, logoUrl } = useInstituteSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const items = navigation.filter((item) => item.roles.some((role) => roles.includes(role)));

  useEffect(() => {
    document.title = `${pageNames[location.pathname] ?? "Workspace"} | ${instituteName}`;
  }, [instituteName, location.pathname]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = search.trim().toLowerCase();
    if (!query) return;
    const destination = items.find((item) => item.label.toLowerCase().includes(query));
    navigate(destination?.href ?? `/assignments?search=${encodeURIComponent(search.trim())}`);
    setSearch("");
  }

  return <div className="app-shell">
    {sidebarOpen && <button className="sidebar-backdrop" onClick={closeSidebar} aria-label="Close navigation" />}
    <aside className={`sidebar ${sidebarOpen ? "sidebar--open" : ""}`}>
      <div className="brand"><div className="brand__mark">{logoUrl ? <img src={logoUrl} alt={instituteName} /> : <span>{instituteName.charAt(0).toUpperCase()}</span>}</div><div><strong>{instituteName}</strong><small>School portal</small></div><button className="sidebar__close" onClick={closeSidebar} aria-label="Close sidebar"><X /></button></div>
      <nav className="sidebar__nav">
        <span className="nav-label">Workspace</span>
        {items.map(({ label, href, icon: Icon }) => <NavLink to={href} end={href === "/"} key={href} onClick={closeSidebar}><Icon /><span>{label}</span></NavLink>)}
        <span className="nav-label nav-label--second">Account</span>
        <NavLink to="/notifications" onClick={closeSidebar}><Bell /><span>Notifications</span></NavLink>
        <NavLink to="/settings" onClick={closeSidebar}><Settings /><span>Settings</span></NavLink>
      </nav>
      <div className="sidebar__profile"><div className="avatar avatar--dark">{initials(profile?.full_name ?? "User")}</div><div><strong>{profile?.full_name}</strong><small>{roles[0]?.replace("_", " ")}</small></div><ChevronDown /></div>
    </aside>
    <div className="main">
      <header className="topbar">
        <button className="mobile-menu" onClick={toggleSidebar} aria-label="Open navigation"><Menu /></button>
        <div className="breadcrumb"><span>{instituteName}</span><b>/</b><strong>{pageNames[location.pathname] ?? "Workspace"}</strong></div>
        <form className="global-search" onSubmit={handleSearch} role="search"><Search /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search workspace..." aria-label="Search workspace" /><kbd>Enter</kbd></form>
        <div className="topbar__actions">
          <button className="icon-button" title="Toggle theme" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>{resolvedTheme === "dark" ? <Sun /> : <Moon />}</button>
          <NavLink to="/notifications" className="icon-button" aria-label="Notifications"><Bell /></NavLink>
          <button className="profile-button" onClick={logout} title="Sign out" aria-label="Sign out"><div className="avatar avatar--small">{initials(profile?.full_name ?? "User")}</div><LogOut /></button>
        </div>
      </header>
      <main className="content"><Outlet /></main>
    </div>
  </div>;
}


