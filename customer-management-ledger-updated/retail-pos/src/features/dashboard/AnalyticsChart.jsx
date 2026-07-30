import { useMemo, useState } from "react";
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowDownRight, ArrowUpRight, BarChart3 } from "lucide-react";

const money = (value) => new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(Number(value || 0));

export default function AnalyticsChart({ data = [] }) {
  const [metric, setMetric] = useState("overview");
  const chartData = useMemo(() => data.map((item) => ({ ...item, net: Number(item.sales || 0) - Number(item.expenses || 0) })), [data]);
  const totals = chartData.reduce((acc, item) => ({ sales: acc.sales + item.sales, expenses: acc.expenses + item.expenses }), { sales: 0, expenses: 0 });
  const margin = totals.sales ? ((totals.sales - totals.expenses) / totals.sales) * 100 : 0;

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_8px_25px_-20px_rgba(15,23,42,0.5)] dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300"><BarChart3 className="size-5" /></div><div><h2 className="font-bold text-slate-900 dark:text-white">Revenue analytics</h2><p className="text-xs text-slate-500">Sales, expenses, and net performance for 6 months</p></div></div>
        <div className="flex w-fit rounded-md bg-slate-100 p-1 dark:bg-slate-800">{[["overview", "Overview"], ["sales", "Sales"], ["expenses", "Expenses"]].map(([value, label]) => <button key={value} type="button" onClick={() => setMetric(value)} className={`h-8 rounded px-3 text-xs font-semibold transition-all ${metric === value ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"}`}>{label}</button>)}</div>
      </div>
      <div className="grid gap-px bg-slate-100 dark:bg-slate-800 sm:grid-cols-3">
        <div className="bg-white px-5 py-3 dark:bg-slate-900"><p className="text-xs text-slate-500">6-month sales</p><p className="mt-1 font-bold text-slate-900 dark:text-white">Rs {money(totals.sales)}</p></div>
        <div className="bg-white px-5 py-3 dark:bg-slate-900"><p className="text-xs text-slate-500">Operating expenses</p><p className="mt-1 font-bold text-slate-900 dark:text-white">Rs {money(totals.expenses)}</p></div>
        <div className="bg-white px-5 py-3 dark:bg-slate-900"><p className="text-xs text-slate-500">Operating margin</p><p className={`mt-1 flex items-center gap-1 font-bold ${margin >= 0 ? "text-emerald-600" : "text-red-600"}`}>{margin >= 0 ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}{margin.toFixed(1)}%</p></div>
      </div>
      <div className="h-80 p-4 pt-6 sm:p-5">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 8, left: -15, bottom: 0 }}>
            <CartesianGrid stroke="#94a3b8" strokeOpacity={0.18} strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={money} />
            <Tooltip formatter={(value, name) => [`Rs ${Number(value).toLocaleString()}`, name.charAt(0).toUpperCase() + name.slice(1)]} contentStyle={{ borderRadius: 6, border: "1px solid #e2e8f0", boxShadow: "0 10px 30px rgba(15,23,42,.12)" }} />
            {metric !== "expenses" && <Bar dataKey="sales" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={34} />}
            {metric !== "sales" && <Bar dataKey="expenses" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={34} />}
            {metric === "overview" && <Line type="monotone" dataKey="net" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }} />}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
