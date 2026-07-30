import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EmptyState({ icon: Icon = Inbox, title = "No records found", description = "There is no data to display yet.", action, className }) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-14 text-center", className)}>
      <div className="rounded-full bg-slate-100 p-4 dark:bg-slate-800"><Icon className="size-8 text-slate-400" aria-hidden="true" /></div>
      <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
      <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
