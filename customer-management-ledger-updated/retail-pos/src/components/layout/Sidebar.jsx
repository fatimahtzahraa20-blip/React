import Logo from "./Logo";
import SidebarItem from "./SidebarItem";
import { navigation } from "@/constants/navigation";

export default function Sidebar() {
  return (
    <aside className="sidebar-shell group fixed inset-y-0 left-0 z-40 w-[76px] overflow-hidden border-r border-slate-800 bg-[#101d2d] shadow-2xl shadow-slate-950/10 transition-[width] duration-300 ease-out hover:w-72">
      <Logo />
      <nav className="h-[calc(100vh-76px)] space-y-1 overflow-x-hidden overflow-y-auto px-3 py-4 [scrollbar-width:thin] [scrollbar-color:#334155_transparent]">{navigation.map((item) => <SidebarItem key={item.title} item={item} />)}</nav>
    </aside>
  );
}
