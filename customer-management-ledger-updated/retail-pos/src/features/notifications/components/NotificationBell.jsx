import { Bell, CheckCheck } from "lucide-react";
import { Link } from "react-router-dom";

import { LoadingSkeleton } from "@/components/shared";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "../hooks/useNotifications";
import useNotificationStore from "../store/notificationStore";
import NotificationItem from "./NotificationItem";

export default function NotificationBell() {
  const panelOpen = useNotificationStore((state) => state.panelOpen);
  const setPanelOpen = useNotificationStore((state) => state.setPanelOpen);
  const { data = [], isLoading } = useNotifications({ limit: 8 });
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const unreadCount = data.filter((item) => !item.read_at).length;

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={panelOpen}
        onClick={() => setPanelOpen(!panelOpen)}
        className="relative flex size-10 items-center justify-center rounded-md border border-white/10 bg-white/5 text-slate-300 transition-all hover:-translate-y-0.5 hover:bg-white/10 hover:text-white"
      >
        <Bell className="size-5" />
        {unreadCount ? (
          <span className="absolute -right-1 -top-1 flex min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-4 text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {panelOpen ? (
        <>
          <button
            type="button"
            aria-label="Close notifications"
            className="fixed inset-0 z-30 cursor-default"
            onClick={() => setPanelOpen(false)}
          />
          <div className="absolute right-0 z-40 mt-2 w-[min(24rem,calc(100vw-2rem))] rounded-lg border border-slate-200 bg-white p-3 text-slate-900 shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:text-white">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Notifications</h3>
                <p className="text-xs text-slate-500">{unreadCount} unread</p>
              </div>
              {unreadCount ? (
                <button
                  type="button"
                  onClick={() => markAll.mutate()}
                  className="flex items-center gap-1 text-xs font-medium text-blue-600"
                >
                  <CheckCheck className="size-4" />
                  Mark all read
                </button>
              ) : null}
            </div>
            <div className="max-h-[28rem] space-y-2 overflow-y-auto">
              {isLoading ? <LoadingSkeleton rows={4} /> : null}
              {!isLoading && !data.length ? (
                <p className="py-8 text-center text-sm text-slate-500">You are all caught up.</p>
              ) : null}
              {data.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  compact
                  onRead={(id) => {
                    if (!notification.read_at) markRead.mutate(id);
                    setPanelOpen(false);
                  }}
                />
              ))}
            </div>
            <Link
              to="/notifications"
              onClick={() => setPanelOpen(false)}
              className="mt-3 block rounded-lg border border-slate-200 py-2 text-center text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              View all notifications
            </Link>
          </div>
        </>
      ) : null}
    </div>
  );
}
