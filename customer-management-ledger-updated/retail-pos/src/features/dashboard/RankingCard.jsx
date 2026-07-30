export default function RankingCard({ title, items, valueKey = "total", valueLabel = "" }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_8px_25px_-20px_rgba(15,23,42,0.5)] dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      <div className="space-y-3">
        {items.length ? items.map((item, index) => (
          <div key={`${item.name}-${index}`} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 dark:border-slate-800">
            <div className="flex items-center gap-3"><span className="flex size-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold dark:bg-slate-800">{index + 1}</span><span className="text-sm font-medium">{item.name}</span></div>
            <span className="text-sm font-semibold">{Number(item[valueKey] || 0).toFixed(valueKey === "quantity" ? 0 : 2)} {valueLabel}</span>
          </div>
        )) : <p className="text-sm text-slate-500">No data available.</p>}
      </div>
    </section>
  );
}

