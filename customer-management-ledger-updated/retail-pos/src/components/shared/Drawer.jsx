import { useEffect } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

export default function Drawer({ open, onClose, title, children, footer, side = "right", className }) {
  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const sideClass = side === "left" ? "left-0" : "right-0";
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="absolute inset-0 bg-slate-950/50" onClick={onClose} aria-label="Close drawer" />
      <section className={cn("absolute inset-y-0 flex w-full max-w-md flex-col bg-white shadow-2xl dark:bg-slate-900", sideClass, className)}>
        <header className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close"><X className="size-5" /></button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer ? <footer className="border-t border-slate-200 p-4 dark:border-slate-800">{footer}</footer> : null}
      </section>
    </div>
  );
}
