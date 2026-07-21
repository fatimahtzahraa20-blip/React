import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  addCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../services/category.service";

import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../types/category";

export default function useCategories() {
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery<Category[], Error>({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const createCategoryMutation = useMutation({
    mutationFn: (category: CreateCategoryInput) => addCategory(category),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["categories"],
      });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({
      id,
      category,
    }: {
      id: string;
      category: UpdateCategoryInput;
    }) => updateCategory(id, category),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["categories"],
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["categories"],
      });

      queryClient.invalidateQueries({
        queryKey: ["subcategories"],
      });

      queryClient.invalidateQueries({
        queryKey: ["videos"],
      });
    },
  });

  return {
    categories: categoriesQuery.data ?? [],
    loading: categoriesQuery.isLoading,
    error: categoriesQuery.error?.message ?? "",

    refetchCategories: categoriesQuery.refetch,

    createCategory: createCategoryMutation.mutateAsync,
    creatingCategory: createCategoryMutation.isPending,

    editCategory: updateCategoryMutation.mutateAsync,
    updatingCategory: updateCategoryMutation.isPending,

    removeCategory: deleteCategoryMutation.mutateAsync,
    deletingCategory: deleteCategoryMutation.isPending,
  };
}