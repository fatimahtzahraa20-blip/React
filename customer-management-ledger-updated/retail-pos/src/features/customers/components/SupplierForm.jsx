import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { FormInput, FormTextarea } from "@/components/shared";
import { createSupplier, updateSupplier } from "@/services/supplierService";
import { supplierSchema } from "../schemas/supplierSchema";

export default function SupplierForm({ defaultValues = null, supplierId = null }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(supplierSchema),
    defaultValues: { name: "", phone: "", email: "", address: "", opening_balance: 0, credit_limit: 0, notes: "", status: true },
  });

  useEffect(() => {
    if (defaultValues) reset({
      name: defaultValues.name || "", phone: defaultValues.phone || "", email: defaultValues.email || "",
      address: defaultValues.address || "", opening_balance: defaultValues.opening_balance ?? 0,
      credit_limit: defaultValues.credit_limit ?? 0, notes: defaultValues.notes || "", status: defaultValues.status ?? true,
    });
  }, [defaultValues, reset]);

  const mutation = useMutation({
    mutationFn: (values) => supplierId ? updateSupplier(supplierId, values) : createSupplier(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success(supplierId ? "Supplier updated" : "Supplier created");
      navigate("/suppliers");
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="grid gap-5 sm:grid-cols-2">
      <FormInput label="Supplier name" required error={errors.name?.message} {...register("name")} />
      <FormInput label="Phone" required error={errors.phone?.message} {...register("phone")} />
      <FormInput label="Email" type="email" error={errors.email?.message} {...register("email")} />
      <FormInput label="Address" error={errors.address?.message} {...register("address")} />
      <FormInput label="Opening balance" type="number" step="0.01" error={errors.opening_balance?.message} {...register("opening_balance")} />
      <FormInput label="Credit limit" type="number" step="0.01" error={errors.credit_limit?.message} {...register("credit_limit")} />
      <FormTextarea label="Notes" className="sm:col-span-2" error={errors.notes?.message} {...register("notes")} />
      <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" className="size-4 rounded" {...register("status")} /> Active supplier</label>
      <div className="flex justify-end gap-3 sm:col-span-2">
        <button type="button" onClick={() => navigate("/suppliers")} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold dark:border-slate-700">Cancel</button>
        <button type="submit" disabled={mutation.isPending} className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{mutation.isPending ? "Saving..." : supplierId ? "Update Supplier" : "Save Supplier"}</button>
      </div>
    </form>
  );
}
