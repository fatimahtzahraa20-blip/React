import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { FormInput, FormSelect, FormTextarea } from "@/components/shared";
import { useAdjustStock, useStockProducts, useWarehouses } from "../hooks/useStock";
import { stockAdjustmentSchema } from "../schemas/stockAdjustmentSchema";

export default function StockAdjustmentForm({ defaultType = "adjustment", onSuccess }) {
  const { data: products = [] } = useStockProducts();
  const { data: warehouses = [] } = useWarehouses();
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: { product_id: "", warehouse_id: "", movement_type: defaultType, quantity: defaultType === "damage" ? -1 : 1, notes: "" },
  });
  const mutation = useAdjustStock({
    onSuccess: () => {
      toast.success("Stock updated successfully");
      reset();
      onSuccess?.();
    },
    onError: (error) => toast.error(error.message),
  });
  return (
    <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="space-y-5">
      <FormSelect label="Product" required options={products.map((item) => ({ value: String(item.id), label: `${item.product_name}${item.barcode ? ` · ${item.barcode}` : ""}` }))} error={errors.product_id?.message} {...register("product_id")} />
      <FormSelect label="Warehouse" required options={warehouses.map((item) => ({ value: String(item.id), label: `${item.name} (${item.code})` }))} error={errors.warehouse_id?.message} {...register("warehouse_id")} />
      <FormSelect label="Movement type" required options={[{ value: "adjustment", label: "Stock adjustment" }, { value: "damage", label: "Damaged stock" }]} error={errors.movement_type?.message} {...register("movement_type")} />
      <FormInput label="Quantity change" type="number" step="0.01" required error={errors.quantity?.message} {...register("quantity")} />
      <FormTextarea label="Reason" required error={errors.notes?.message} {...register("notes")} />
      <button type="submit" disabled={mutation.isPending} className="h-10 w-full rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white disabled:opacity-50">{mutation.isPending ? "Updating..." : "Update Stock"}</button>
    </form>
  );
}
