import { create } from "zustand";

const useAuthStore = create((set) => ({

    user: null,

    session: null,

    loading: true,
    profile: null,
    role: null,
    permissions: [],

    setUser: (user) => set({ user }),

    setSession: (session) => set({ session }),

    setLoading: (loading) => set({ loading }),
    setAccess: ({ profile = null, role = null, permissions = [] } = {}) =>
        set({ profile, role, permissions }),

    logout: () =>
        set({
            user: null,
            session: null,
            profile: null,
            role: null,
            permissions: []
        })

}));

export default useAuthStore;
