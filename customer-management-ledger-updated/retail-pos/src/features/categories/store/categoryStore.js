import { create } from "zustand";

const useCategoryStore = create((set) => ({
  search: "",
  status: "all",
  setSearch: (search) => set({ search }),
  setStatus: (status) => set({ status }),
  resetFilters: () => set({ search: "", status: "all" }),
}));

export default useCategoryStore;
