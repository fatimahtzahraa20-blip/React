import { useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { ConfirmDialog } from "@/components/shared";
import { useDeactivateUnit } from "../hooks/useUnits";

export default function UnitActions({ unit }) {
  const [open, setOpen] = useState(false);
  const mutation = useDeactivateUnit({
    onSuccess: () => {
      toast.success("Unit deactivated successfully");
      setOpen(false);
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <>
      <div className="flex justify-center gap-1">
        <Link to={`/units/${unit.id}/edit`} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-800" aria-label={`Edit ${unit.name}`}>
          <Pencil className="size-4" />
        </Link>
        {unit.status ? (
          <button type="button" onClick={() => setOpen(true)} className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950" aria-label={`Deactivate ${unit.name}`}>
            <Trash2 className="size-4" />
          </button>
        ) : null}
      </div>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => mutation.mutate(unit.id)}
        title="Deactivate unit?"
        description={`${unit.name} will become inactive. Existing products and stock history will remain connected.`}
        confirmLabel="Deactivate"
        isLoading={mutation.isPending}
      />
    </>
  );
}
