import { create } from "zustand";
import api from "../api/axiosInstance";

const useDashboardStore = create((set, get) => ({
  user: null,
  pages: [],
  selectedPage: null,
  loading: false,
  isLoggedIn: false,
  error: null,

  // Load User
  fetchUser: async () => {
    try {
      set({ loading: true });

      const res = await api.get("/auth/me");

      // console.log("AUTH ME RESPONSE:", res.user);

      set({
        user: res.user, // ✅ FIXED
        isLoggedIn: true,
        error: null,
      });

    } catch (err) {
      set({
        error:
          err.response?.data?.message || err.message || "Failed to load user",
        user: null,
        isLoggedIn: false,
      });

    } finally {
      set({ loading: false }); // ✅ FIXED
    }
  },
}));

export default useDashboardStore;