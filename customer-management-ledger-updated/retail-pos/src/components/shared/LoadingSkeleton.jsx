import { cn } from "@/lib/utils";

export default function LoadingSkeleton({ rows = 6, className }) {
  return (
    <div role="status" aria-label="Loading" className={cn("space-y-3", className)}>
      {Array.from({ length: rows }, (_, index) => <div key={index} className="h-12 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />)}
      <span className="sr-only">Loading...</span>
    </div>
  );
}
