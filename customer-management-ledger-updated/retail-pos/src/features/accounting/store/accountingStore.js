import { create } from "zustand";
const useAccountingStore = create((set) => ({ tab: "chart", search: "", setTab: (tab) => set({ tab }), setSearch: (search) => set({ search }) }));
export default useAccountingStore;
