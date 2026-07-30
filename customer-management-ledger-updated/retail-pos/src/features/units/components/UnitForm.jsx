import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { FormInput } from "@/components/shared";
import { useCreateUnit, useUpdateUnit } from "../hooks/useUnits";
import { unitSchema } from "../schemas/unitSchema";

export default function UnitForm({ unit = null }) {
  const navigate = useNavigate();
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(unitSchema),
    defaultValues: { name: "", short_name: "", status: true },
  });

  useEffect(() => {
    if (unit) reset({
      name: unit.name || "",
      short_name: unit.short_name || "",
      status: unit.status ?? true,
    });
  }, [unit, reset]);

  const options = {
    onSuccess: () => {
      toast.success(unit ? "Unit updated successfully" : "Unit created successfully");
      navigate("/units");
    },
    onError: (error) => toast.error(error.message),
  };
  const createMutation = useCreateUnit(options);
  const updateMutation = useUpdateUnit(options);
  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (values) => unit
    ? updateMutation.mutate({ id: unit.id, values })
    : createMutation.mutate(values);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <FormInput label="Unit name" required placeholder="e.g. Kilogram" error={errors.name?.message} {...register("name")} />
      <FormInput label="Short name" required placeholder="e.g. kg" error={errors.short_name?.message} {...register("short_name")} />
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
        <input type="checkbox" className="size-4 rounded border-slate-300" {...register("status")} />
        Active unit
      </label>
      <div className="flex justify-end gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
        <button type="button" onClick={() => navigate("/units")} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">Cancel</button>
        <button type="submit" disabled={isPending} className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
          {isPending ? "Saving..." : unit ? "Update Unit" : "Save Unit"}
        </button>
      </div>
    </form>
  );
}
