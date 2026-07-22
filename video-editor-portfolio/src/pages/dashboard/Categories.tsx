import { useEffect, useState } from "react";
import {
  addCategory,
  deleteCategory,
  getCategories,
} from "../../services/category.service";
import type { Category } from "../../types/category";

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    try {
      setLoading(true);

      await addCategory({
        name: name.trim(),
        slug: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: null,
      });

      setName("");

      loadCategories();
    } catch (error) {
      console.error(error);
      alert("Failed to add category.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this category?")) return;

    try {
      await deleteCategory(id);

      loadCategories();
    } catch (error) {
      console.error(error);
      alert("Failed to delete category.");
    }
  };

  return (
    <div className="min-h-screen bg-black p-8 text-white">
      <div className="mx-auto max-w-5xl">

        <h1 className="mb-8 text-3xl font-bold text-amber-400">
          Categories
        </h1>

        {/* Add Category */}

        <form
          onSubmit={handleAdd}
          className="mb-10 flex flex-col gap-4 md:flex-row"
        >
          <input
            type="text"
            placeholder="Category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 p-3 outline-none focus:border-amber-400"
          />

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-amber-400 px-6 py-3 font-semibold text-black hover:bg-amber-500"
          >
            {loading ? "Adding..." : "Add"}
          </button>
        </form>

        {/* Category List */}

        <div className="overflow-hidden rounded-xl border border-zinc-800">

          <table className="w-full">

            <thead className="bg-zinc-900">
              <tr>
                <th className="p-4 text-left">Category</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td
                    colSpan={2}
                    className="p-6 text-center text-gray-400"
                  >
                    No categories found.
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr
                    key={category.id}
                    className="border-t border-zinc-800"
                  >
                    <td className="p-4">{category.name}</td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="rounded bg-red-600 px-4 py-2 hover:bg-red-700"
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