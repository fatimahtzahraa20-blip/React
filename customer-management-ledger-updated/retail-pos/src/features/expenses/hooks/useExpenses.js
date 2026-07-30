import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createExpenseCategory, getExpenseCategories, getExpenses, postExpense, reverseExpense } from "../services/expenseService";

export const useExpenses = () => useQuery({ queryKey: ["expenses"], queryFn: getExpenses });
export const useExpenseCategories = () => useQuery({ queryKey: ["expense-categories"], queryFn: getExpenseCategories });
function useExpenseMutation(fn, options = {}) {
  const client = useQueryClient();
  return useMutation({ mutationFn: fn, ...options, onSuccess: (...args) => { client.invalidateQueries({ queryKey: ["expenses"] }); client.invalidateQueries({ queryKey: ["expense-categories"] }); client.invalidateQueries({ queryKey: ["general-ledger"] }); options.onSuccess?.(...args); } });
}
export const useCreateExpenseCategory = (options) => useExpenseMutation(createExpenseCategory, options);
export const usePostExpense = (options) => useExpenseMutation(postExpense, options);
export const useReverseExpense = (options) => useExpenseMutation(reverseExpense, options);
