import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { FormInput, FormTextarea } from "@/components/shared";
import { useCreateCategory, useUpdateCategory } from "../hooks/useCategories";
import { categorySchema } from "../schemas/categorySchema";

export default function CategoryForm({ category = null }) {
  const navigate = useNavigate();
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", description: "", status: true },
  });

  useEffect(() => {
    if (category) {
      reset({
        name: category.name || "",
        description: category.description || "",
        status: category.status ?? true,
      });
    }
  }, [category, reset]);

  const options = {
    onSuccess: () => {
      toast.success(category ? "Category updated successfully" : "Category created successfully");
      navigate("/categories");
    },
    onError: (error) => toast.error(error.message),
  };
  const createMutation = useCreateCategory(options);
  const updateMutation = useUpdateCategory(options);
  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (values) => {
    if (category) {
      updateMutation.mutate({ id: category.id, values });
    } else {
      createMutation.mutate(values);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <FormInput label="Category name" required placeholder="e.g. Electronics" error={errors.name?.message} {...register("name")} />
      <FormTextarea label="Description" placeholder="Optional category description" error={errors.description?.message} {...register("description")} />
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
        <input type="checkbox" className="size-4 rounded border-slate-300" {...register("status")} />
        Active category
      </label>
      <div className="flex justify-end gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
        <button type="button" onClick={() => navigate("/categories")} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">Cancel</button>
        <button type="submit" disabled={isPending} className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
          {isPending ? "Saving..." : category ? "Update Category" : "Save Category"}
        </button>
      </div>
    </form>
  );
}
