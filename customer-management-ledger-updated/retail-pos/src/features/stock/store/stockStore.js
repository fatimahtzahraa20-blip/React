import { create } from "zustand";

const useStockStore = create((set) => ({
  search: "",
  view: "all",
  warehouseId: "all",
  setSearch: (search) => set({ search }),
  setView: (view) => set({ view }),
  setWarehouseId: (warehouseId) => set({ warehouseId }),
  resetFilters: () => set({ search: "", view: "all", warehouseId: "all" }),
}));

export default useStockStore;
