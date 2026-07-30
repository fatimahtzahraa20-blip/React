import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { ConfirmDialog } from "@/components/shared";
import { useDeactivateProduct } from "../hooks/useProducts";

export default function ProductActions({ product }) {
  const [open, setOpen] = useState(false);
  const mutation = useDeactivateProduct({
    onSuccess: () => {
      toast.success("Product deactivated successfully");
      setOpen(false);
    },
    onError: (error) => toast.error(error.message),
  });
  return (
    <>
      <div className="flex justify-center gap-1">
        <Link to={`/products/${product.id}`} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label={`View ${product.name}`}><Eye className="size-4" /></Link>
        <Link to={`/products/${product.id}/edit`} className="rounded-lg p-2 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800" aria-label={`Edit ${product.name}`}><Pencil className="size-4" /></Link>
        {product.status ? <button type="button" onClick={() => setOpen(true)} className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950" aria-label={`Deactivate ${product.name}`}><Trash2 className="size-4" /></button> : null}
      </div>
      <ConfirmDialog open={open} onClose={() => setOpen(false)} onConfirm={() => mutation.mutate(product.id)} title="Deactivate product?" description={`${product.name} will be hidden from new sales and purchases. Existing stock and transaction history will remain connected.`} confirmLabel="Deactivate" isLoading={mutation.isPending} />
    </>
  );
}
