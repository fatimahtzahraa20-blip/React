import { useEffect, useMemo, useState, type FormEvent } from "react";
import supabase from "../../lib/supabase";

type Category = {
  id: string | number;
  name: string;
  created_at?: string | null;
};

type SubCategory = {
  id: string | number;
  name: string;
  category_id: string | number;
  created_at?: string | null;
};

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);

  const [categoryName, setCategoryName] = useState("");
  const [subCategoryName, setSubCategoryName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const [editingCategoryId, setEditingCategoryId] = useState<string | number | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");

  const [editingSubCategoryId, setEditingSubCategoryId] = useState<string | number | null>(null);
  const [editingSubCategoryName, setEditingSubCategoryName] = useState("");

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");

    const [categoriesResult, subCategoriesResult] = await Promise.all([
      supabase.from("categories").select("*").order("name"),
      supabase.from("sub_categories").select("*").order("name"),
    ]);

    if (categoriesResult.error) {
      setError(categoriesResult.error.message);
      setCategories([]);
    } else {
      setCategories((categoriesResult.data ?? []) as Category[]);
    }

    if (subCategoriesResult.error) {
      setError(subCategoriesResult.error.message);
      setSubCategories([]);
    } else {
      setSubCategories((subCategoriesResult.data ?? []) as SubCategory[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    void loadData();
  }, []);

  const groupedCategories = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return categories
      .map((category) => {
        const items = subCategories.filter(
          (subCategory) =>
            String(subCategory.category_id) === String(category.id)
        );

        const matchesCategory = category.name
          .toLowerCase()
          .includes(normalizedSearch);

        const matchingItems = normalizedSearch
          ? items.filter((item) =>
              item.name.toLowerCase().includes(normalizedSearch)
            )
          : items;

        return {
          category,
          items: matchesCategory ? items : matchingItems,
          visible: matchesCategory || matchingItems.length > 0 || !normalizedSearch,
        };
      })
      .filter((group) => group.visible);
  }, [categories, subCategories, search]);

  const addCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = categoryName.trim();

    if (!name) {
      setError("Enter a category name.");
      return;
    }

    if (
      categories.some(
        (category) => category.name.toLowerCase() === name.toLowerCase()
      )
    ) {
      setError("This category already exists.");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    const { data, error: insertError } = await supabase
      .from("categories")
      .insert({ name })
      .select("*")
      .single();

    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setCategories((current) =>
      [...current, data as Category].sort((a, b) =>
        a.name.localeCompare(b.name)
      )
    );
    setCategoryName("");
    setMessage(`Category "${name}" added successfully.`);
  };

  const addSubCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = subCategoryName.trim();

    if (!selectedCategoryId) {
      setError("Select a parent category.");
      return;
    }

    if (!name) {
      setError("Enter a subcategory name.");
      return;
    }

    if (
      subCategories.some(
        (item) =>
          String(item.category_id) === selectedCategoryId &&
          item.name.toLowerCase() === name.toLowerCase()
      )
    ) {
      setError("This subcategory already exists in the selected category.");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    const { data, error: insertError } = await supabase
      .from("sub_categories")
      .insert({
        name,
        category_id: selectedCategoryId,
      })
      .select("*")
      .single();

    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setSubCategories((current) =>
      [...current, data as SubCategory].sort((a, b) =>
        a.name.localeCompare(b.name)
      )
    );
    setSubCategoryName("");
    setMessage(`Subcategory "${name}" added successfully.`);
  };

  const saveCategoryEdit = async (category: Category) => {
    const name = editingCategoryName.trim();

    if (!name) {
      setError("Category name cannot be empty.");
      return;
    }

    const { error: updateError } = await supabase
      .from("categories")
      .update({ name })
      .eq("id", category.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setCategories((current) =>
      current.map((item) =>
        item.id === category.id ? { ...item, name } : item
      )
    );
    setEditingCategoryId(null);
    setEditingCategoryName("");
    setMessage("Category updated successfully.");
  };

  const saveSubCategoryEdit = async (subCategory: SubCategory) => {
    const name = editingSubCategoryName.trim();

    if (!name) {
      setError("Subcategory name cannot be empty.");
      return;
    }

    const { error: updateError } = await supabase
      .from("sub_categories")
      .update({ name })
      .eq("id", subCategory.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSubCategories((current) =>
      current.map((item) =>
        item.id === subCategory.id ? { ...item, name } : item
      )
    );
    setEditingSubCategoryId(null);
    setEditingSubCategoryName("");
    setMessage("Subcategory updated successfully.");
  };

  const deleteSubCategory = async (subCategory: SubCategory) => {
    if (!window.confirm(`Delete "${subCategory.name}"?`)) {
      return;
    }

    const { error: deleteError } = await supabase
      .from("sub_categories")
      .delete()
      .eq("id", subCategory.id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setSubCategories((current) =>
      current.filter((item) => item.id !== subCategory.id)
    );
    setMessage("Subcategory deleted successfully.");
  };

  const deleteCategory = async (category: Category) => {
    const relatedItems = subCategories.filter(
      (item) => String(item.category_id) === String(category.id)
    );

    const confirmed = window.confirm(
      relatedItems.length
        ? `Delete "${category.name}" and its ${relatedItems.length} subcategories?`
        : `Delete "${category.name}"?`
    );

    if (!confirmed) {
      return;
    }

    if (relatedItems.length > 0) {
      const { error: subDeleteError } = await supabase
        .from("sub_categories")
        .delete()
        .eq("category_id", category.id);

      if (subDeleteError) {
        setError(subDeleteError.message);
        return;
      }
    }

    const { error: categoryDeleteError } = await supabase
      .from("categories")
      .delete()
      .eq("id", category.id);

    if (categoryDeleteError) {
      setError(categoryDeleteError.message);
      return;
    }

    setCategories((current) =>
      current.filter((item) => item.id !== category.id)
    );
    setSubCategories((current) =>
      current.filter(
        (item) => String(item.category_id) !== String(category.id)
      )
    );
    setMessage("Category deleted successfully.");
  };

  return (
    <main className="min-h-screen bg-zinc-50 px-4 pb-16 pt-28 text-zinc-950 dark:bg-zinc-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="mb-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-600">
            Admin Panel
          </p>

          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Categories Management</h1>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                Add, edit, search, and remove categories and subcategories.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadData()}
              className="rounded-lg border border-zinc-300 px-5 py-3 font-semibold transition hover:border-red-600 hover:text-red-600 dark:border-zinc-700"
            >
              Refresh
            </button>
          </div>
        </section>

        {message && (
          <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        <section className="mb-8 grid gap-6 lg:grid-cols-2">
          <form
            onSubmit={addCategory}
            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <h2 className="text-xl font-bold">Add Category</h2>

            <input
              type="text"
              value={categoryName}
              onChange={(event) => setCategoryName(event.target.value)}
              placeholder="Category name"
              className="mt-5 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-red-600 dark:border-zinc-700 dark:bg-zinc-950"
            />

            <button
              type="submit"
              disabled={saving}
              className="mt-4 rounded-lg bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
            >
              Add Category
            </button>
          </form>

          <form
            onSubmit={addSubCategory}
            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <h2 className="text-xl font-bold">Add Subcategory</h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <select
                value={selectedCategoryId}
                onChange={(event) =>
                  setSelectedCategoryId(event.target.value)
                }
                className="rounded-lg border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-red-600 dark:border-zinc-700 dark:bg-zinc-950"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={String(category.id)}>
                    {category.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={subCategoryName}
                onChange={(event) =>
                  setSubCategoryName(event.target.value)
                }
                placeholder="Subcategory name"
                className="rounded-lg border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-red-600 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-4 rounded-lg bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
            >
              Add Subcategory
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search categories or subcategories..."
            className="mb-6 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-red-600 dark:border-zinc-700 dark:bg-zinc-950"
          />

          {loading ? (
            <p className="py-14 text-center text-zinc-500">Loading...</p>
          ) : groupedCategories.length === 0 ? (
            <p className="py-14 text-center text-zinc-500">
              No categories found.
            </p>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {groupedCategories.map(({ category, items }) => (
                <article
                  key={category.id}
                  className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className="flex items-center justify-between gap-3">
                    {editingCategoryId === category.id ? (
                      <input
                        value={editingCategoryName}
                        onChange={(event) =>
                          setEditingCategoryName(event.target.value)
                        }
                        className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
                      />
                    ) : (
                      <h3 className="text-lg font-bold">{category.name}</h3>
                    )}

                    <div className="flex gap-2">
                      {editingCategoryId === category.id ? (
                        <button
                          type="button"
                          onClick={() => void saveCategoryEdit(category)}
                          className="text-sm font-semibold text-emerald-600"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategoryId(category.id);
                            setEditingCategoryName(category.name);
                          }}
                          className="text-sm font-semibold text-red-600"
                        >
                          Edit
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => void deleteCategory(category)}
                        className="text-sm font-semibold text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 space-y-2">
                    {items.length === 0 ? (
                      <p className="text-sm text-zinc-500">
                        No subcategories.
                      </p>
                    ) : (
                      items.map((subCategory) => (
                        <div
                          key={subCategory.id}
                          className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900"
                        >
                          {editingSubCategoryId === subCategory.id ? (
                            <input
                              value={editingSubCategoryName}
                              onChange={(event) =>
                                setEditingSubCategoryName(event.target.value)
                              }
                              className="min-w-0 flex-1 rounded border border-zinc-300 bg-white px-2 py-1 dark:border-zinc-700 dark:bg-zinc-950"
                            />
                          ) : (
                            <span className="text-sm">{subCategory.name}</span>
                          )}

                          <div className="flex gap-2">
                            {editingSubCategoryId === subCategory.id ? (
                              <button
                                type="button"
                                onClick={() =>
                                  void saveSubCategoryEdit(subCategory)
                                }
                                className="text-xs font-semibold text-emerald-600"
                              >
                                Save
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingSubCategoryId(subCategory.id);
                                  setEditingSubCategoryName(subCategory.name);
                                }}
                                className="text-xs font-semibold text-red-600"
                              >
                                Edit
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                void deleteSubCategory(subCategory)
                              }
                              className="text-xs font-semibold text-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}