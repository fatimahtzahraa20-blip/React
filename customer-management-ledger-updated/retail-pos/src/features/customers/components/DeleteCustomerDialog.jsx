import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { ConfirmDialog } from "@/components/shared";
import { deleteCustomer } from "@/services/customerService";

export default function DeleteCustomerDialog({ customer }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => deleteCustomer(customer.id),
    onSuccess: () => {
      toast.success("Customer deactivated successfully");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setOpen(false);
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950" aria-label={`Deactivate ${customer.name}`}>
        <Trash2 className="size-4" />
      </button>
      <ConfirmDialog open={open} onClose={() => setOpen(false)} onConfirm={() => mutation.mutate()} title="Deactivate customer?" description={`${customer.name} will become inactive. Existing ledger and transaction history will be preserved.`} confirmLabel="Deactivate" isLoading={mutation.isPending} />
    </>
  );
}
