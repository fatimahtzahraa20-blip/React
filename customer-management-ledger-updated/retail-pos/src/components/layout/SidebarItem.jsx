import { ChevronDown, ChevronRight } from "lucide-react";
import { NavLink } from "react-router-dom";
import useSidebarStore from "@/store/sidebarStore";

export default function SidebarItem({ item }) {
  const Icon = item.icon;
  const { openMenus, toggleMenu } = useSidebarStore();
  if (!item.children) {
    return <NavLink to={item.url} title={item.title} className={({ isActive }) => `flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-all duration-200 ${isActive ? "bg-blue-600 text-white shadow-md shadow-blue-950/30" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}><Icon className="size-[18px] shrink-0" /><span className="sidebar-label whitespace-nowrap">{item.title}</span></NavLink>;
  }
  return (
    <div>
      <button type="button" onClick={() => toggleMenu(item.title)} title={item.title} className="flex h-11 w-full items-center justify-between rounded-md px-3 text-sm font-medium text-slate-300 transition-all duration-200 hover:bg-white/10 hover:text-white">
        <div className="flex items-center gap-3"><Icon className="size-[18px] shrink-0" /><span className="sidebar-label whitespace-nowrap">{item.title}</span></div>
        <span className="sidebar-label">{openMenus[item.title] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}</span>
      </button>
      {openMenus[item.title] && <div className="sidebar-label ml-10 mt-1 space-y-1 border-l border-slate-700 pl-3">{item.children.map((child) => <NavLink key={child.url} to={child.url} className={({ isActive }) => `block rounded-md px-3 py-2 text-sm transition-colors ${isActive ? "bg-blue-500/15 font-semibold text-blue-300" : "text-slate-400 hover:bg-white/10 hover:text-white"}`}>{child.title}</NavLink>)}</div>}
    </div>
  );
}
