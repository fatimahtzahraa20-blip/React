import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { AlertTriangle, CheckCircle2, CircleAlert, Info } from "lucide-react";
import { Link } from "react-router-dom";

dayjs.extend(relativeTime);

const icons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: CircleAlert,
};

const tones = {
  info: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  error: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

export default function NotificationItem({ notification, onRead, compact = false }) {
  const Icon = icons[notification.type] || Info;
  const content = (
    <div
      className={`flex gap-3 rounded-lg border p-3 transition hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
        notification.read_at
          ? "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
          : "border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20"
      }`}
    >
      <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${tones[notification.type] || tones.info}`}>
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2">
          <span className="font-medium text-slate-900 dark:text-slate-100">{notification.title}</span>
          {!notification.read_at ? <span className="mt-1.5 size-2 shrink-0 rounded-full bg-blue-600" /> : null}
        </span>
        <span className={`mt-0.5 block text-sm text-slate-600 dark:text-slate-400 ${compact ? "line-clamp-2" : ""}`}>
          {notification.message}
        </span>
        <span className="mt-1 block text-xs text-slate-400">{dayjs(notification.created_at).fromNow()}</span>
      </span>
    </div>
  );

  if (notification.action_url) {
    return (
      <Link to={notification.action_url} onClick={() => onRead?.(notification.id)}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className="w-full text-left" onClick={() => onRead?.(notification.id)}>
      {content}
    </button>
  );
}
