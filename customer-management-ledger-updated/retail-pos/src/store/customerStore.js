import { create } from "zustand";

const useCustomerStore = create((set) => ({

    customers: [],

    loading: false,

    selectedCustomer: null,

    setCustomers: (customers) =>
        set({ customers }),

    setLoading: (loading) =>
        set({ loading }),

    setSelectedCustomer: (customer) =>
        set({ selectedCustomer: customer })

}));

export default useCustomerStore;