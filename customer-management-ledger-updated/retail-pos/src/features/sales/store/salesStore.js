import { create } from "zustand";

const useSalesStore = create((set) => ({
  search: "",
  status: "all",
  customerId: "all",
  setSearch: (search) => set({ search }),
  setStatus: (status) => set({ status }),
  setCustomerId: (customerId) => set({ customerId }),
  reset: () => set({ search: "", status: "all", customerId: "all" }),
}));

export default useSalesStore;
