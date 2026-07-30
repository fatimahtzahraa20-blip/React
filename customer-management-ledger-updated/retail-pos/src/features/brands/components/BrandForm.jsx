import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { FormInput, FormTextarea } from "@/components/shared";
import { useCreateBrand, useUpdateBrand } from "../hooks/useBrands";
import { brandSchema } from "../schemas/brandSchema";

export default function BrandForm({ brand = null }) {
  const navigate = useNavigate();
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(brandSchema),
    defaultValues: { name: "", description: "", status: true },
  });

  useEffect(() => {
    if (brand) {
      reset({
        name: brand.name || "",
        description: brand.description || "",
        status: brand.status ?? true,
      });
    }
  }, [brand, reset]);

  const options = {
    onSuccess: () => {
      toast.success(brand ? "Brand updated successfully" : "Brand created successfully");
      navigate("/brands");
    },
    onError: (error) => toast.error(error.message),
  };
  const createMutation = useCreateBrand(options);
  const updateMutation = useUpdateBrand(options);
  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (values) => {
    if (brand) {
      updateMutation.mutate({ id: brand.id, values });
    } else {
      createMutation.mutate(values);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <FormInput label="Brand name" required placeholder="e.g. Samsung" error={errors.name?.message} {...register("name")} />
      <FormTextarea label="Description" placeholder="Optional brand description" error={errors.description?.message} {...register("description")} />
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
        <input type="checkbox" className="size-4 rounded border-slate-300" {...register("status")} />
        Active brand
      </label>
      <div className="flex justify-end gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
        <button type="button" onClick={() => navigate("/brands")} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">Cancel</button>
        <button type="submit" disabled={isPending} className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
          {isPending ? "Saving..." : brand ? "Update Brand" : "Save Brand"}
        </button>
      </div>
    </form>
  );
}
