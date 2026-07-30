import { create } from "zustand";

const useSupplierStore = create((set) => ({

    suppliers: [],

    selectedSupplier: null,

    search: "",

    loading: false,

    setSuppliers: (suppliers) =>
        set({ suppliers }),

    setSelectedSupplier: (supplier) =>
        set({ selectedSupplier: supplier }),

    setSearch: (search) =>
        set({ search }),

    setLoading: (loading) =>
        set({ loading })

}));

export default useSupplierStore;