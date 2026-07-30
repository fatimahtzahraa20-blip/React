import { create } from "zustand";
const useExpenseStore = create((set) => ({ search: "", categoryId: "all", setSearch: (search) => set({ search }), setCategoryId: (categoryId) => set({ categoryId }) }));
export default useExpenseStore;
