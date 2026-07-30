import { create } from "zustand";

const useNotificationStore = create((set) => ({
  category: "all",
  unreadOnly: false,
  panelOpen: false,
  setCategory: (category) => set({ category }),
  setUnreadOnly: (unreadOnly) => set({ unreadOnly }),
  setPanelOpen: (panelOpen) => set({ panelOpen }),
}));

export default useNotificationStore;
