import { useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { ConfirmDialog } from "@/components/shared";
import { useDeactivateBrand } from "../hooks/useBrands";

export default function BrandActions({ brand }) {
  const [open, setOpen] = useState(false);
  const mutation = useDeactivateBrand({
    onSuccess: () => {
      toast.success("Brand deactivated successfully");
      setOpen(false);
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <>
      <div className="flex justify-center gap-1">
        <Link to={`/brands/${brand.id}/edit`} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-800" aria-label={`Edit ${brand.name}`}>
          <Pencil className="size-4" />
        </Link>
        {brand.status ? (
          <button type="button" onClick={() => setOpen(true)} className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950" aria-label={`Deactivate ${brand.name}`}>
            <Trash2 className="size-4" />
          </button>
        ) : null}
      </div>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => mutation.mutate(brand.id)}
        title="Deactivate brand?"
        description={`${brand.name} will become inactive. Existing products and transaction history will remain connected.`}
        confirmLabel="Deactivate"
        isLoading={mutation.isPending}
      />
    </>
  );
}
