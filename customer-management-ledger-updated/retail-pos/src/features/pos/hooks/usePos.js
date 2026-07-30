import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteHeldSale, getHeldSales, getInvoice, getPosCustomers, getPosProducts, holdSale, postSale } from "../services/posService";

export const usePosProducts = (warehouseId) => useQuery({ queryKey: ["pos-products", warehouseId], queryFn: () => getPosProducts(warehouseId), enabled: Boolean(warehouseId) });
export const usePosCustomers = () => useQuery({ queryKey: ["pos-customers"], queryFn: getPosCustomers });
export const useHeldSales = () => useQuery({ queryKey: ["held-sales"], queryFn: getHeldSales });
export const useInvoice = (id) => useQuery({ queryKey: ["invoice", id], queryFn: () => getInvoice(id), enabled: Boolean(id) });

export function usePostSale(options = {}) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: postSale,
    ...options,
    onSuccess: (...args) => {
      ["stock", "pos-products", "sales", "customers", "customer-ledger", "dashboard", "accounts"].forEach((key) => {
        client.invalidateQueries({ queryKey: [key] });
      });
      options.onSuccess?.(...args);
    },
  });
}

export function useHoldSale(options = {}) {
  const client = useQueryClient();
  return useMutation({ mutationFn: holdSale, ...options, onSuccess: (...args) => { client.invalidateQueries({ queryKey: ["held-sales"] }); options.onSuccess?.(...args); } });
}

export function useDeleteHeldSale() {
  const client = useQueryClient();
  return useMutation({ mutationFn: deleteHeldSale, onSuccess: () => client.invalidateQueries({ queryKey: ["held-sales"] }) });
}

