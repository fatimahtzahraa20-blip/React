import {
  LayoutDashboard,
  Video,
  FolderKanban,
  FolderTree,
  Mail,
  Settings,
  LogOut,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const menu = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin",
  },
  {
    title: "Videos",
    icon: Video,
    path: "/admin/videos",
  },
  {
    title: "Categories",
    icon: FolderKanban,
    path: "/admin/categories",
  },
  {
    title: "Sub Categories",
    icon: FolderTree,
    path: "/admin/subcategories",
  },
  {
    title: "Messages",
    icon: Mail,
    path: "/admin/messages",
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/admin/settings",
  },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-white/10 bg-zinc-950 md:flex md:flex-col">
      <div className="flex h-20 items-center justify-center border-b border-white/10">
        <h1 className="text-2xl font-bold">
          Edit<span className="text-violet-500">Studio</span>
        </h1>
      </div>

      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.title}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-4 py-3 transition ${
                      isActive
                        ? "bg-violet-600 text-white"
                        : "text-gray-300 hover:bg-zinc-900 hover:text-white"
                    }`
                  }
                >
                  <Icon size={20} />
                  {item.title}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-4">
        <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-gray-300 transition hover:bg-red-600 hover:text-white">
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}