import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  subCategorySchema,
  type SubCategoryFormValues,
} from "../../schemas/subcategory.schema";

import type { Category } from "../../types/category";

interface SubCategoryFormProps {
  categories: Category[];
  defaultValues?: Partial<SubCategoryFormValues>;
  loading?: boolean;
  submitLabel?: string;
  onSubmit: (values: SubCategoryFormValues) => Promise<void> | void;
  onCancel?: () => void;
}

export default function SubCategoryForm({
  categories,
  defaultValues,
  loading = false,
  submitLabel = "Save Subcategory",
  onSubmit,
  onCancel,
}: SubCategoryFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SubCategoryFormValues>({
    resolver: zodResolver(subCategorySchema),
    defaultValues: {
      category_id: defaultValues?.category_id ?? "",
      name: defaultValues?.name ?? "",
      slug: defaultValues?.slug ?? "",
    },
  });

  const name = watch("name");
  const slug = watch("slug");

  useEffect(() => {
    reset({
      category_id: defaultValues?.category_id ?? "",
      name: defaultValues?.name ?? "",
      slug: defaultValues?.slug ?? "",
    });
  }, [defaultValues, reset]);

  useEffect(() => {
    if (!defaultValues?.slug && name && !slug) {
      const generatedSlug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

      setValue("slug", generatedSlug, {
        shouldValidate: true,
      });
    }
  }, [name, slug, defaultValues?.slug, setValue]);

  const submitForm = async (values: SubCategoryFormValues) => {
    await onSubmit(values);

    if (!defaultValues) {
      reset({
        category_id: "",
        name: "",
        slug: "",
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(submitForm)}
      className="space-y-5 rounded-2xl border border-white/10 bg-zinc-950 p-6"
    >
      <div>
        <label
          htmlFor="category_id"
          className="mb-2 block text-sm font-medium text-zinc-200"
        >
          Parent Category
        </label>

        <select
          id="category_id"
          {...register("category_id")}
          disabled={loading}
          className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-white/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="">Select a category</option>

          {categories.map((category) => (
            <option
              key={category.id}
              value={category.id}
            >
              {category.name}
            </option>
          ))}
        </select>

        {errors.category_id && (
          <p className="mt-2 text-sm text-red-400">
            {errors.category_id.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-medium text-zinc-200"
        >
          Subcategory Name
        </label>

        <input
          id="name"
          type="text"
          placeholder="For example: Product Commercials"
          {...register("name")}
          disabled={loading}
          className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-white/30 disabled:cursor-not-allowed disabled:opacity-60"
        />

        {errors.name && (
          <p className="mt-2 text-sm text-red-400">
            {errors.name.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="slug"
          className="mb-2 block text-sm font-medium text-zinc-200"
        >
          Slug
        </label>

        <input
          id="slug"
          type="text"
          placeholder="product-commercials"
          {...register("slug")}
          disabled={loading}
          className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-white/30 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <p className="mt-2 text-xs text-zinc-500">
          Use lowercase letters, numbers, and hyphens only.
        </p>

        {errors.slug && (
          <p className="mt-2 text-sm text-red-400">
            {errors.slug.message}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-white px-5 py-3 font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Saving..." : submitLabel}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-white/10 px-5 py-3 font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}