import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, Settings2, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { navigation } from "@/constants/navigation";

const STORAGE_KEY = "retail-pro-quick-access";
const DEFAULTS = ["/dashboard", "/pos", "/products", "/customers"];
const MAX_SHORTCUTS = 6;

function getOptions() {
  const seen = new Set();
  return navigation.flatMap((section) => {
    const Icon = section.icon;
    const entries = section.children?.length
      ? section.children.map((child) => ({ ...child, group: section.title, icon: Icon }))
      : [{ title: section.title, url: section.url, group: "General", icon: Icon }];
    return entries.filter((entry) => entry.url && !seen.has(entry.url) && seen.add(entry.url));
  });
}

export default function QuickAccess() {
  const options = useMemo(getOptions, []);
  const [open, setOpen] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || DEFAULTS; }
    catch { return DEFAULTS; }
  });
  const rootRef = useRef(null);

  useEffect(() => {
    const close = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
        setCustomizing(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const save = (next) => {
    setSelected(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };
  const toggle = (url) => {
    if (selected.includes(url)) return save(selected.filter((item) => item !== url));
    if (selected.length >= MAX_SHORTCUTS) return;
    save([...selected, url]);
  };
  const pinned = selected.map((url) => options.find((option) => option.url === url)).filter(Boolean);
  const filtered = options.filter((option) => `${option.title} ${option.group}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div ref={rootRef} className="relative">
      <div className="flex h-10 items-center rounded-md border border-white/10 bg-white/5 p-1">
        <div className="hidden items-center xl:flex">
          {pinned.slice(0, 4).map(({ title, url, icon: Icon }) => (
            <Link key={url} to={url} title={title} className="flex size-8 items-center justify-center rounded text-slate-300 transition hover:bg-white/10 hover:text-white">
              <Icon className="size-4" />
            </Link>
          ))}
        </div>
        <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} className="flex h-8 items-center gap-2 rounded px-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10 sm:px-3">
          <Zap className="size-4 text-amber-400" />
          <span className="hidden 2xl:inline">Quick Access</span>
          <ChevronDown className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      {open ? (
        <div className="absolute right-0 top-12 z-50 w-[min(92vw,420px)] overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-800 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <div><p className="text-sm font-bold">Quick Access</p><p className="text-xs text-slate-400">Your most-used workspaces</p></div>
            <button type="button" onClick={() => setCustomizing((value) => !value)} className={`flex size-8 items-center justify-center rounded-md transition ${customizing ? "bg-blue-50 text-blue-600 dark:bg-blue-950" : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`} title="Customize shortcuts"><Settings2 className="size-4" /></button>
          </div>

          {customizing ? (
            <div>
              <div className="border-b border-slate-100 p-3 dark:border-slate-800">
                <div className="relative"><Search className="absolute left-3 top-2.5 size-4 text-slate-400" /><input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search all modules..." className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-800" /></div>
                <p className="mt-2 text-xs text-slate-400">Choose up to {MAX_SHORTCUTS} shortcuts · {selected.length}/{MAX_SHORTCUTS} selected</p>
              </div>
              <div className="max-h-80 overflow-y-auto p-2">
                {filtered.map(({ title, url, group, icon: Icon }) => {
                  const active = selected.includes(url);
                  const disabled = !active && selected.length >= MAX_SHORTCUTS;
                  return <button key={url} type="button" disabled={disabled} onClick={() => toggle(url)} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition hover:bg-slate-50 disabled:opacity-40 dark:hover:bg-slate-800"><div className={`flex size-8 items-center justify-center rounded-md ${active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500 dark:bg-slate-800"}`}><Icon className="size-4" /></div><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{title}</span><span className="block truncate text-xs text-slate-400">{group}</span></span><span className={`flex size-5 items-center justify-center rounded border ${active ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 dark:border-slate-600"}`}>{active ? <Check className="size-3.5" /> : null}</span></button>;
                })}
              </div>
            </div>
          ) : (
            <div className="p-3">
              {pinned.length ? <div className="grid grid-cols-2 gap-2">{pinned.map(({ title, url, group, icon: Icon }) => <Link key={url} to={url} onClick={() => setOpen(false)} className="group flex min-w-0 items-center gap-3 rounded-md border border-slate-100 p-3 transition hover:border-blue-200 hover:bg-blue-50 dark:border-slate-800 dark:hover:bg-slate-800"><div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500 transition group-hover:bg-blue-600 group-hover:text-white dark:bg-slate-800"><Icon className="size-4" /></div><span className="min-w-0"><span className="block truncate text-sm font-semibold">{title}</span><span className="block truncate text-xs text-slate-400">{group}</span></span></Link>)}</div> : <div className="py-8 text-center"><Zap className="mx-auto size-7 text-slate-300" /><p className="mt-2 text-sm font-semibold">No shortcuts selected</p></div>}
              <button type="button" onClick={() => setCustomizing(true)} className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 text-xs font-semibold text-slate-500 hover:border-blue-300 hover:text-blue-600 dark:border-slate-700"><Settings2 className="size-3.5" /> Customize Quick Access</button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

