import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { ConfirmDialog } from "@/components/shared";
import { deleteSupplier } from "@/services/supplierService";

export default function DeleteSupplierDialog({ supplier }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => deleteSupplier(supplier.id),
    onSuccess: () => {
      toast.success("Supplier deactivated successfully");
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      setOpen(false);
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950" aria-label={`Deactivate ${supplier.name}`}>
        <Trash2 className="size-4" />
      </button>
      <ConfirmDialog open={open} onClose={() => setOpen(false)} onConfirm={() => mutation.mutate()} title="Deactivate supplier?" description={`${supplier.name} will become inactive. Existing ledger, purchase, and transaction history will be preserved.`} confirmLabel="Deactivate" isLoading={mutation.isPending} />
    </>
  );
}
