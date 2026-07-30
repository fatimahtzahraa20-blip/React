import { create } from "zustand";

const useSidebarStore = create((set) => ({

  openMenus: {},

  toggleMenu: (menu) =>
    set((state) => ({
      openMenus: {
        ...state.openMenus,
        [menu]: !state.openMenus[menu]
      }
    }))

}));

export default useSidebarStore;