import { create } from "zustand";

const useSettingsStore = create((set) => ({
  activeSection: "company",
  setActiveSection: (activeSection) => set({ activeSection }),
}));

export default useSettingsStore;
