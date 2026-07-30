import dayjs from "dayjs";
import { CheckCheck, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

import { DataTable, EmptyState, PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/layouts/DashboardLayout";
import useAuthStore from "@/store/authStore";
import NotificationItem from "../components/NotificationItem";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useRefreshSystemAlerts,
  useSystemLogs,
} from "../hooks/useNotifications";
import useNotificationStore from "../store/notificationStore";

const categories = ["all", "stock", "payment", "system", "security"];

export default function NotificationsPage() {
  const category = useNotificationStore((state) => state.category);
  const unreadOnly = useNotificationStore((state) => state.unreadOnly);
  const setCategory = useNotificationStore((state) => state.setCategory);
  const setUnreadOnly = useNotificationStore((state) => state.setUnreadOnly);
  const permissions = useAuthStore((state) => state.permissions);
  const role = useAuthStore((state) => state.role);
  const canViewLogs = role?.slug === "admin" || permissions.includes("users.manage");
  const { data = [], isLoading } = useNotifications({ limit: 100, unreadOnly });
  const filtered = category === "all" ? data : data.filter((item) => item.category === category);
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead({
    onSuccess: () => toast.success("All notifications marked as read"),
    onError: (error) => toast.error(error.message),
  });
  const refresh = useRefreshSystemAlerts({
    onSuccess: () => toast.success("System alerts refreshed"),
    onError: (error) => toast.error(error.message),
  });
  const { data: logs = [], isLoading: logsLoading, isError: logsError } = useSystemLogs(100);

  const logColumns = [
    { key: "created_at", header: "Date", render: (row) => dayjs(row.created_at).format("DD MMM YYYY, hh:mm A") },
    { key: "module", header: "Module" },
    { key: "action", header: "Action" },
    { key: "entity_type", header: "Entity" },
    { key: "entity_id", header: "Reference" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Notifications"
          description="Low stock, outstanding payments, operational alerts, and system activity."
          actions={
            <>
              <Button variant="outline" size="lg" disabled={refresh.isPending} onClick={() => refresh.mutate()}>
                <RefreshCw className={refresh.isPending ? "animate-spin" : ""} />
                Refresh alerts
              </Button>
              <Button size="lg" disabled={markAll.isPending} onClick={() => markAll.mutate()}>
                <CheckCheck />
                Mark all read
              </Button>
            </>
          }
        />

        <div className="flex flex-wrap items-center gap-2">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`rounded-full px-4 py-2 text-sm font-medium capitalize ${
                category === item
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300"
              }`}
            >
              {item}
            </button>
          ))}
          <label className="ml-auto flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(event) => setUnreadOnly(event.target.checked)}
              className="size-4 accent-blue-600"
            />
            Unread only
          </label>
        </div>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-3">
            {isLoading ? <p className="py-8 text-center text-sm text-slate-500">Loading notifications...</p> : null}
            {!isLoading && !filtered.length ? (
              <EmptyState title="No notifications" description="There are no alerts matching the selected filters." />
            ) : null}
            {filtered.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={(id) => {
                  if (!notification.read_at) markRead.mutate(id);
                }}
              />
            ))}
          </div>
        </section>

        {canViewLogs ? (
          <section className="space-y-3">
            <div>
              <h2 className="text-xl font-semibold">System logs</h2>
              <p className="text-sm text-slate-500">Latest audited actions across protected modules.</p>
            </div>
            {logsError ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                System logs are unavailable until the Sprint 22 RBAC migration is applied.
              </div>
            ) : (
              <DataTable columns={logColumns} data={logs} isLoading={logsLoading} />
            )}
          </section>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
