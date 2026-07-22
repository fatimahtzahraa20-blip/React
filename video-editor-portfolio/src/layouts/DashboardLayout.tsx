import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Video,
  Folder,
  FolderTree,
  Mail,
  Settings,
  LogOut,
} from "lucide-react";

import { logout } from "../services/auth.service";

export default function DashboardLayout() {
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate("/admin/login", { replace: true });
    } catch (error) {
      console.error(error);
    }
  }

  const menuItems = [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Videos",
      path: "/dashboard/videos",
      icon: Video,
    },
    {
      title: "Categories",
      path: "/dashboard/categories",
      icon: Folder,
    },
    {
      title: "Sub Categories",
      path: "/dashboard/subcategories",
      icon: FolderTree,
    },
    {
      title: "Messages",
      path: "/dashboard/messages",
      icon: Mail,
    },
    {
      title: "Settings",
      path: "/dashboard/settings",
      icon: Settings,
    },
  ];

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      {/* Sidebar */}
      <aside className="w-72 border-r border-zinc-800 bg-zinc-900">
        <div className="border-b border-zinc-800 p-6">
          <h1 className="text-2xl font-bold">
            Admin Panel
          </h1>

          <p className="mt-1 text-sm text-gray-400">
            Video Portfolio
          </p>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/dashboard"}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-3 transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-zinc-800 hover:text-white"
                  }`
                }
              >
                <Icon size={20} />
                <span>{item.title}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-0 w-72 px-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 font-medium transition hover:bg-red-700"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Top Bar */}
        <header className="flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-900 px-8">
          <h2 className="text-xl font-semibold">
            Dashboard
          </h2>

          <span className="text-sm text-gray-400">
            Welcome, Admin
          </span>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-zinc-950 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}