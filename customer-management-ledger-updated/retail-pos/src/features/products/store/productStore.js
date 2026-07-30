import { create } from "zustand";

const useProductStore = create((set) => ({
  search: "",
  status: "all",
  categoryId: "all",
  setSearch: (search) => set({ search }),
  setStatus: (status) => set({ status }),
  setCategoryId: (categoryId) => set({ categoryId }),
  resetFilters: () => set({ search: "", status: "all", categoryId: "all" }),
}));

export default useProductStore;
