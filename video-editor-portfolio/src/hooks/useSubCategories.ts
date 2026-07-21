import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  addSubCategory,
  deleteSubCategory,
  getSubCategories,
  updateSubCategory,
} from "../services/subcategory.service.ts";

import type {
  CreateSubCategoryInput,
  SubCategory,
  UpdateSubCategoryInput,
} from "../types/subcategory";

export default function useSubCategories() {
  const queryClient = useQueryClient();

  const subCategoriesQuery = useQuery<SubCategory[], Error>({
    queryKey: ["subcategories"],
    queryFn: getSubCategories,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateSubCategoryInput) =>
      addSubCategory(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["subcategories"],
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateSubCategoryInput;
    }) => updateSubCategory(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["subcategories"],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      deleteSubCategory(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["subcategories"],
      });

      queryClient.invalidateQueries({
        queryKey: ["videos"],
      });
    },
  });

  return {
    subCategories: subCategoriesQuery.data ?? [],
    loading: subCategoriesQuery.isLoading,
    error: subCategoriesQuery.error?.message ?? "",

    refetchSubCategories:
      subCategoriesQuery.refetch,

    createSubCategory:
      createMutation.mutateAsync,

    creatingSubCategory:
      createMutation.isPending,

    editSubCategory:
      updateMutation.mutateAsync,

    updatingSubCategory:
      updateMutation.isPending,

    removeSubCategory:
      deleteMutation.mutateAsync,

    deletingSubCategory:
      deleteMutation.isPending,
  };
}