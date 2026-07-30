import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cancelSale, getSale, getSaleLedger, getSales, getSalesReturns, returnSale } from "../services/salesService";

export const useSales = () => useQuery({ queryKey: ["sales"], queryFn: getSales });
export const useSale = (id) => useQuery({ queryKey: ["sales", id], queryFn: () => getSale(id), enabled: Boolean(id) });
export const useSaleLedger = (id) => useQuery({ queryKey: ["sales", id, "ledger"], queryFn: () => getSaleLedger(id), enabled: Boolean(id) });

function useSaleMutation(fn, options = {}) {
  const client = useQueryClient();
  return useMutation({ mutationFn: fn, ...options, onSuccess: (...args) => { client.invalidateQueries({ queryKey: ["sales"] }); client.invalidateQueries({ queryKey: ["stock"] }); client.invalidateQueries({ queryKey: ["sales-returns"] }); options.onSuccess?.(...args); } });
}
export const useCancelSale = (options) => useSaleMutation(cancelSale, options);
export const useReturnSale = (options) => useSaleMutation(returnSale, options);

export const useSalesReturns = () => useQuery({ queryKey: ["sales-returns"], queryFn: getSalesReturns });
