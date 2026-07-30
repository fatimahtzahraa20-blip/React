import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { adjustStock, getStock, getStockMovements, getStockProducts, getWarehouses } from "../services/stockService";

export const stockKeys = {
  all: ["stock"],
  movements: ["stock-movements"],
  warehouses: ["warehouses"],
  products: ["stock-products"],
};

export function useStock() {
  return useQuery({ queryKey: stockKeys.all, queryFn: getStock });
}

export function useStockMovements() {
  return useQuery({ queryKey: stockKeys.movements, queryFn: getStockMovements });
}

export function useWarehouses() {
  return useQuery({ queryKey: stockKeys.warehouses, queryFn: getWarehouses });
}

export function useStockProducts() {
  return useQuery({ queryKey: stockKeys.products, queryFn: getStockProducts });
}

export function useAdjustStock(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adjustStock,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: stockKeys.all });
      queryClient.invalidateQueries({ queryKey: stockKeys.movements });
      options.onSuccess?.(...args);
    },
  });
}
