import { useMemo, useState } from "react";
import { Edit, Plus, Search, Trash2, X } from "lucide-react";

import SubCategoryForm from "../forms/SubCategoryForm";
import useCategories from "../../hooks/useCategories";
import useSubCategories from "../../hooks/useSubCategories";

import type { SubCategory } from "../../types/subcategory";
import type { SubCategoryFormValues } from "../../schemas/subcategory.schema";

export default function SubCategories() {
  const { categories, loading: categoriesLoading } = useCategories();

  const {
    subCategories,
    loading,
    error,
    createSubCategory,
    creatingSubCategory,
    editSubCategory,
    updatingSubCategory,
    removeSubCategory,
    deletingSubCategory,
  } = useSubCategories();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingSubCategory, setEditingSubCategory] =
    useState<SubCategory | null>(null);
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const filteredSubCategories = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return subCategories.filter((subCategory) => {
      const matchesSearch =
        !normalizedSearch ||
        subCategory.name.toLowerCase().includes(normalizedSearch) ||
        subCategory.slug.toLowerCase().includes(normalizedSearch) ||
        subCategory.category?.name
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesCategory =
        !selectedCategory ||
        subCategory.category_id === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [subCategories, searchTerm, selectedCategory]);

  const openCreateForm = () => {
    setEditingSubCategory(null);
    setActionError("");
    setSuccessMessage("");
    setShowForm(true);
  };

  const openEditForm = (subCategory: SubCategory) => {
    setEditingSubCategory(subCategory);
    setActionError("");
    setSuccessMessage("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingSubCategory(null);
    setActionError("");
  };

  const handleSubmit = async (
    values: SubCategoryFormValues
  ) => {
    try {
      setActionError("");
      setSuccessMessage("");

      if (editingSubCategory) {
        await editSubCategory({
          id: editingSubCategory.id,
          data: values,
        });

        setSuccessMessage(
          "Subcategory updated successfully."
        );
      } else {
        await createSubCategory(values);

        setSuccessMessage(
          "Subcategory created successfully."
        );
      }

      closeForm();
    } catch (submitError) {
      setActionError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save the subcategory."
      );
    }
  };

  const handleDelete = async (
    subCategory: SubCategory
  ) => {
    const confirmed = window.confirm(
      `Delete "${subCategory.name}"? Videos linked to this subcategory may also be affected.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionError("");
      setSuccessMessage("");

      await removeSubCategory(subCategory.id);

      setSuccessMessage(
        "Subcategory deleted successfully."
      );

      if (editingSubCategory?.id === subCategory.id) {
        closeForm();
      }
    } catch (deleteError) {
      setActionError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete the subcategory."
      );
    }
  };

  const isSaving =
    creatingSubCategory || updatingSubCategory;

  return (
    <section className="min-h-screen bg-black px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.25em] text-zinc-500">
              Dashboard
            </p>

            <h1 className="text-3xl font-bold sm:text-4xl">
              Subcategories
            </h1>

            <p className="mt-2 text-zinc-400">
              Organize portfolio videos under specific
              category groups.
            </p>
          </div>

          <button
            type="button"
            onClick={
              showForm && !editingSubCategory
                ? closeForm
                : openCreateForm
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 font-medium text-black transition hover:bg-zinc-200"
          >
            {showForm && !editingSubCategory ? (
              <>
                <X size={18} />
                Close Form
              </>
            ) : (
              <>
                <Plus size={18} />
                Add Subcategory
              </>
            )}
          </button>
        </div>

        {(actionError || error) && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {actionError || error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {successMessage}
          </div>
        )}

        {showForm && (
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {editingSubCategory
                  ? "Edit Subcategory"
                  : "Create Subcategory"}
              </h2>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <SubCategoryForm
              categories={categories}
              defaultValues={
                editingSubCategory
                  ? {
                      category_id:
                        editingSubCategory.category_id,
                      name: editingSubCategory.name,
                      slug: editingSubCategory.slug,
                    }
                  : undefined
              }
              loading={
                isSaving || categoriesLoading
              }
              submitLabel={
                editingSubCategory
                  ? "Update Subcategory"
                  : "Create Subcategory"
              }
              onSubmit={handleSubmit}
              onCancel={closeForm}
            />
          </div>
        )}

        <div className="mb-6 grid gap-4 rounded-2xl border border-white/10 bg-zinc-950 p-4 md:grid-cols-[1fr_240px]">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
            />

            <input
              type="search"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              placeholder="Search by name, slug, or category..."
              className="w-full rounded-lg border border-white/10 bg-black py-3 pl-11 pr-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-white/30"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(event) =>
              setSelectedCategory(event.target.value)
            }
            className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-white/30"
          >
            <option value="">All categories</option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center text-zinc-400">
              Loading subcategories...
            </div>
          ) : filteredSubCategories.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
              <h3 className="text-lg font-semibold">
                No subcategories found
              </h3>

              <p className="mt-2 max-w-md text-sm text-zinc-500">
                Add a new subcategory or change your
                search and category filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead className="border-b border-white/10 bg-white/[0.03]">
                  <tr className="text-left text-sm text-zinc-400">
                    <th className="px-6 py-4 font-medium">
                      Name
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Slug
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Category
                    </th>

                    <th className="px-6 py-4 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredSubCategories.map(
                    (subCategory) => (
                      <tr
                        key={subCategory.id}
                        className="border-b border-white/5 last:border-b-0"
                      >
                        <td className="px-6 py-4">
                          <p className="font-medium text-white">
                            {subCategory.name}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <code className="rounded-md bg-white/5 px-2 py-1 text-sm text-zinc-400">
                            {subCategory.slug}
                          </code>
                        </td>

                        <td className="px-6 py-4 text-zinc-300">
                          {subCategory.category?.name ??
                            "Unassigned"}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                openEditForm(
                                  subCategory
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/10 hover:text-white"
                            >
                              <Edit size={16} />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  subCategory
                                )
                              }
                              disabled={
                                deletingSubCategory
                              }
                              className="inline-flex items-center gap-2 rounded-lg border border-red-500/20 px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Trash2 size={16} />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}