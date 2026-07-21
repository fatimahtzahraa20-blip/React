import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "../../services/supabase";
import { getCategories } from "../../services/category.service";
import type { Category } from "../../types/category";

interface SubCategory {
  id: string;
  name: string;
  category_id: string;
  created_at?: string;
  categories?: {
    name: string;
  } | null;
}

export default function SubCategories() {
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setPageLoading(true);
      setError("");

      const categoryData = await getCategories();
      setCategories(categoryData);

      const { data, error: subCategoryError } = await supabase
        .from("subcategories")
        .select(`
          id,
          name,
          category_id,
          created_at,
          categories (
            name
          )
        `)
        .order("created_at", { ascending: false });

      if (subCategoryError) {
        throw subCategoryError;
      }

      setSubCategories((data as unknown as SubCategory[]) ?? []);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load subcategories.";

      setError(message);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim() || !categoryId) {
      setError("Enter a subcategory name and select a category.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const { error: insertError } = await supabase
        .from("subcategories")
        .insert([
          {
            name: name.trim(),
            category_id: categoryId,
          },
        ]);

      if (insertError) {
        throw insertError;
      }

      setName("");
      setCategoryId("");
      await loadData();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to add subcategory.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this subcategory?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const { error: deleteError } = await supabase
        .from("subcategories")
        .delete()
        .eq("id", id);

      if (deleteError) {
        throw deleteError;
      }

      setSubCategories((current) =>
        current.filter((subCategory) => subCategory.id !== id)
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to delete subcategory.";

      setError(message);
    }
  };

  return (
    <div className="min-h-screen bg-black p-6 text-white md:p-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-amber-400">
            Subcategories
          </h1>

          <p className="mt-2 text-gray-400">
            Add and manage subcategories for your portfolio videos.
          </p>
        </div>

        <form
          onSubmit={handleAdd}
          className="mb-8 grid gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 md:grid-cols-3"
        >
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Subcategory name"
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-amber-400"
          />

          <select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none focus:border-amber-400"
          >
            <option value="">Select category</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-amber-400 px-6 py-3 font-semibold text-black transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Adding..." : "Add Subcategory"}
          </button>
        </form>

        {error && (
          <div className="mb-6 rounded-lg border border-red-800 bg-red-950 p-4 text-red-300">
            {error}
          </div>
        )}

        <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900">
          <table className="w-full min-w-[600px]">
            <thead className="border-b border-zinc-800 bg-zinc-950">
              <tr>
                <th className="px-6 py-4 text-left">Subcategory</th>
                <th className="px-6 py-4 text-left">Category</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {pageLoading ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-8 text-center text-gray-400"
                  >
                    Loading subcategories...
                  </td>
                </tr>
              ) : subCategories.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-8 text-center text-gray-400"
                  >
                    No subcategories found.
                  </td>
                </tr>
              ) : (
                subCategories.map((subCategory) => (
                  <tr
                    key={subCategory.id}
                    className="border-b border-zinc-800 last:border-b-0"
                  >
                    <td className="px-6 py-4 font-medium">
                      {subCategory.name}
                    </td>

                    <td className="px-6 py-4 text-gray-400">
                      {subCategory.categories?.name ?? "No category"}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(subCategory.id)}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}