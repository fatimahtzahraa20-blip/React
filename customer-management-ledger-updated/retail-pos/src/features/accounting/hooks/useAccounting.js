import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createAccount, getAccounts, getGeneralLedger, postJournal, setAccountStatus, setOpeningBalance, updateAccount } from "../services/accountingService";

export const useAccounts = () => useQuery({ queryKey: ["accounts"], queryFn: getAccounts });
export const useGeneralLedger = () => useQuery({ queryKey: ["general-ledger"], queryFn: getGeneralLedger });
function useAccountingMutation(fn, options = {}) {
  const client = useQueryClient();
  return useMutation({ mutationFn: fn, ...options, onSuccess: (...args) => { client.invalidateQueries({ queryKey: ["accounts"] }); client.invalidateQueries({ queryKey: ["general-ledger"] }); options.onSuccess?.(...args); } });
}
export const useCreateAccount = (options) => useAccountingMutation(createAccount, options);
export const useUpdateAccount = (options) => useAccountingMutation(updateAccount, options);
export const useSetAccountStatus = (options) => useAccountingMutation(setAccountStatus, options);
export const usePostJournal = (options) => useAccountingMutation(postJournal, options);
export const useSetOpeningBalance = (options) => useAccountingMutation(setOpeningBalance, options);
