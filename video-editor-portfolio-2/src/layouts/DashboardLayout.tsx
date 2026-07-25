import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Outlet } from "react-router-dom";

import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import { useTheme } from "../context/ThemeContext";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme } = useTheme();

  return (
    <div className="dashboard-theme min-h-screen text-zinc-950 transition-colors dark:text-white" data-theme={theme}>
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="fixed left-4 top-5 z-40 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-zinc-950/90 text-white shadow-lg backdrop-blur transition hover:bg-purple-600 lg:hidden"
        aria-label="Open dashboard menu"
      >
        <Menu size={21} />
      </button>

      <div className="flex min-h-screen">
        <div className="hidden lg:block">
          <DashboardSidebar />
        </div>

        {sidebarOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="absolute inset-0 bg-black/60"
              aria-label="Close dashboard menu overlay"
            />

            <div className="relative h-full w-72 max-w-[85vw]">
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-zinc-900 text-white transition hover:bg-zinc-800"
                aria-label="Close dashboard menu"
              >
                <X size={20} />
              </button>

              <DashboardSidebar />
            </div>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
