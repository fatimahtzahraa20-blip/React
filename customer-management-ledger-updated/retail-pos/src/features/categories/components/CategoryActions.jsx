import { useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { ConfirmDialog } from "@/components/shared";
import { useDeactivateCategory } from "../hooks/useCategories";

export default function CategoryActions({ category }) {
  const [open, setOpen] = useState(false);
  const mutation = useDeactivateCategory({
    onSuccess: () => {
      toast.success("Category deactivated successfully");
      setOpen(false);
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <>
      <div className="flex justify-center gap-1">
        <Link to={`/categories/${category.id}/edit`} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-800" aria-label={`Edit ${category.name}`}>
          <Pencil className="size-4" />
        </Link>
        {category.status ? (
          <button type="button" onClick={() => setOpen(true)} className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950" aria-label={`Deactivate ${category.name}`}>
            <Trash2 className="size-4" />
          </button>
        ) : null}
      </div>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => mutation.mutate(category.id)}
        title="Deactivate category?"
        description={`${category.name} will become inactive. Existing products and transaction history will remain connected.`}
        confirmLabel="Deactivate"
        isLoading={mutation.isPending}
      />
    </>
  );
}
