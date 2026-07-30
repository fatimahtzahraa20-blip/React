import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createCategory,
  deactivateCategory,
  getCategories,
  getCategoryById,
  updateCategory,
} from "../services/categoryService";

export const categoryKeys = {
  all: ["categories"],
  detail: (id) => ["categories", id],
};

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.all,
    queryFn: getCategories,
  });
}

export function useCategory(id) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => getCategoryById(id),
    enabled: Boolean(id),
  });
}

export function useCreateCategory(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCategory,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      options.onSuccess?.(...args);
    },
  });
}

export function useUpdateCategory(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }) => updateCategory(id, values),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      options.onSuccess?.(...args);
    },
  });
}

export function useDeactivateCategory(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deactivateCategory,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      options.onSuccess?.(...args);
    },
  });
}
