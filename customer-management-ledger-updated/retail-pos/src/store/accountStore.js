import { create } from "zustand";

const useAccountStore = create((set) => ({

    accounts: [],

    loading: false,

    selectedAccount: null,

    setAccounts: (accounts) =>
        set({ accounts }),

    setLoading: (loading) =>
        set({ loading }),

    setSelectedAccount: (account) =>
        set({ selectedAccount: account })

}));

export default useAccountStore;