import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createProduct,
  deactivateProduct,
  getProductById,
  getProductHistory,
  getProducts,
  updateProduct,
} from "../services/productService";

export const productKeys = {
  all: ["products"],
  detail: (id) => ["products", id],
  history: (id) => ["products", id, "history"],
};

export function useProducts() {
  return useQuery({ queryKey: productKeys.all, queryFn: getProducts });
}

export function useProduct(id) {
  return useQuery({ queryKey: productKeys.detail(id), queryFn: () => getProductById(id), enabled: Boolean(id) });
}

export function useProductHistory(id) {
  return useQuery({ queryKey: productKeys.history(id), queryFn: () => getProductHistory(id), enabled: Boolean(id) });
}

function useProductMutation(mutationFn, options) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      options?.onSuccess?.(...args);
    },
  });
}

export function useCreateProduct(options = {}) {
  return useProductMutation(createProduct, options);
}

export function useUpdateProduct(options = {}) {
  return useProductMutation(({ id, payload }) => updateProduct(id, payload), options);
}

export function useDeactivateProduct(options = {}) {
  return useProductMutation(deactivateProduct, options);
}
