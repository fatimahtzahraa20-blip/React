import { cn } from "@/lib/utils";

export default function StatsCard({ title, value, icon: Icon, change, changeLabel, tone = "blue", className }) {
  const tones = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-950",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-950",
    red: "bg-red-50 text-red-600 dark:bg-red-950",
    violet: "bg-violet-50 text-violet-600 dark:bg-violet-950",
  };
  return (
    <article className={cn("group rounded-lg border border-slate-200 bg-white p-5 shadow-[0_8px_25px_-20px_rgba(15,23,42,0.5)] transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 dark:border-slate-800 dark:bg-slate-900", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
        </div>
        {Icon ? <div className={cn("rounded-xl p-3", tones[tone] || tones.blue)}><Icon className="size-5" /></div> : null}
      </div>
      {change !== undefined ? <p className="mt-3 text-xs text-slate-500"><span className={change >= 0 ? "font-semibold text-emerald-600" : "font-semibold text-red-600"}>{change >= 0 ? "+" : ""}{change}%</span>{changeLabel ? ` ${changeLabel}` : ""}</p> : null}
    </article>
  );
}

