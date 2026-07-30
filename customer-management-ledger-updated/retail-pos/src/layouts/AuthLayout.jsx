import { BarChart3, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

export default function AuthLayout({ children }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4f7fb] px-4 py-8 sm:px-8">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-700 via-cyan-500 to-emerald-400" />
      <div className="pointer-events-none absolute -left-32 top-28 size-80 rounded-full bg-blue-100/70 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-10 size-96 rounded-full bg-emerald-100/60 blur-3xl" />
      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-lg border border-slate-200/80 bg-white shadow-[0_28px_80px_-32px_rgba(15,23,42,0.35)] lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative hidden overflow-hidden bg-[#0d1f33] p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:36px_36px]" />
          <div className="absolute -right-24 top-28 size-72 rounded-full border-[52px] border-cyan-400/10" />
          <div className="relative flex items-center gap-3"><div className="flex size-11 items-center justify-center rounded-lg bg-blue-600 shadow-lg shadow-blue-950/40"><BarChart3 className="size-6" /></div><div><p className="text-lg font-bold">Retail Pro</p><p className="text-xs text-slate-400">Business Management</p></div></div>
          <div className="relative max-w-md">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-cyan-300"><Sparkles className="size-3.5" /> One workspace. Total clarity.</div>
            <h1 className="text-4xl font-bold leading-tight">Run your retail business with confidence.</h1>
            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-300">Sales, stock, customers, and accounts come together in one secure command center.</p>
            <div className="mt-9 grid gap-4 text-sm text-slate-200 sm:grid-cols-2"><div className="flex items-center gap-2"><CheckCircle2 className="size-4 text-emerald-400" /> Live business insights</div><div className="flex items-center gap-2"><ShieldCheck className="size-4 text-cyan-400" /> Secure access</div></div>
          </div>
          <p className="relative text-xs text-slate-500">Retail operations, beautifully organized.</p>
        </section>
        <section className="flex items-center justify-center px-5 py-12 sm:px-12">{children}</section>
      </div>
    </main>
  );
}
