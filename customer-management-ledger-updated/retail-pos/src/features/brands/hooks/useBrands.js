import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createBrand,
  deactivateBrand,
  getBrandById,
  getBrands,
  updateBrand,
} from "../services/brandService";

export const brandKeys = {
  all: ["brands"],
  detail: (id) => ["brands", id],
};

export function useBrands() {
  return useQuery({
    queryKey: brandKeys.all,
    queryFn: getBrands,
  });
}

export function useBrand(id) {
  return useQuery({
    queryKey: brandKeys.detail(id),
    queryFn: () => getBrandById(id),
    enabled: Boolean(id),
  });
}

export function useCreateBrand(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBrand,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: brandKeys.all });
      options.onSuccess?.(...args);
    },
  });
}

export function useUpdateBrand(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }) => updateBrand(id, values),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: brandKeys.all });
      options.onSuccess?.(...args);
    },
  });
}

export function useDeactivateBrand(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deactivateBrand,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: brandKeys.all });
      options.onSuccess?.(...args);
    },
  });
}
