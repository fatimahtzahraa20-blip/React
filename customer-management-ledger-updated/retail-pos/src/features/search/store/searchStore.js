import { create } from "zustand";

const initialFilters = {
  query: "",
  types: [],
  status: "all",
  from: "",
  to: "",
  sorts: [{ key: "relevance", direction: "desc" }],
};

const useSearchStore = create((set) => ({
  ...initialFilters,
  setQuery: (query) => set({ query }),
  setStatus: (status) => set({ status }),
  setDateRange: ({ from, to }) => set({ from, to }),
  toggleType: (type) =>
    set((state) => ({
      types: state.types.includes(type)
        ? state.types.filter((item) => item !== type)
        : [...state.types, type],
    })),
  setSorts: (sorts) => set({ sorts }),
  applyFilter: (filter) => set({ ...initialFilters, ...filter }),
  reset: () => set(initialFilters),
}));

export { initialFilters };
export default useSearchStore;
