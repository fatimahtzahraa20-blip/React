import { useEffect } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

export default function Modal({ open, onClose, title, description, children, footer, className }) {
  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={onClose} aria-label="Close modal" />
      <section className={cn("relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900", className)}>
        <header className="flex items-start justify-between border-b border-slate-200 p-5 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800" aria-label="Close">
            <X className="size-5" />
          </button>
        </header>
        <div className="p-5">{children}</div>
        {footer ? <footer className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">{footer}</footer> : null}
      </section>
    </div>
  );
}
