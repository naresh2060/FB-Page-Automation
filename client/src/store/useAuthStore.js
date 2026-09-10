// store/useAuthStore.js
import { create } from "zustand";
import api from "../api/axiosInstance.js";

const useAuthStore = create((set, get) => ({

  // ── State ────────────────────────────────────────────────────────
  user: null,   // { id, name, email, plan, avatar, timezone }
  isLoggedIn: false, // controls ProtectedLayout
  isLoading: false, // shows spinners on buttons
  error: null,  // shows error messages in forms


  // ── Login ────────────────────────────────────────────────────────
  login: async (credentials) => {
    // credentials = { email: "john@gmail.com", password: "123456" }

    set({ isLoading: true, error: null });
    // isLoading = true  → button shows "Logging in..."
    // error = null      → clears any previous error

    try {
      const data = await api.post("/auth/login", credentials);
      // data = { user: { id, name, email, plan }, token: "eyJhb..." }

      localStorage.setItem("token", data.token);
      // save token so user stays logged in after page refresh

      set({
        user: data.user,
        isLoggedIn: true,
        error: null,
      });
      // every component reading these values re-renders automatically

    } catch (err) {
      set({ error: err.message || "Login failed" });
      // error = "Invalid credentials"
      // modal stays open — user can fix and retry
      // isLoggedIn stays false — user is NOT logged in

    } finally {
      set({ isLoading: false });
      // always runs — success or fail
      // button goes back to normal
    }
  },


  // ── Register ─────────────────────────────────────────────────────
  register: async (userData) => {
    // userData = { name, email, password }

    set({ isLoading: true, error: null });

    try {
      const data = await api.post("/auth/register", userData);
      // data = { user: { id, name, email }, token: "eyJhb..." }

      localStorage.setItem("token", data.token);

      set({
        user: data.user,
        isLoggedIn: true,
        error: null,
      });

    } catch (err) {
      set({ error: err.message || "Registration failed" });
      // e.g. "Email already registered"

    } finally {
      set({ isLoading: false });
    }
  },


  // ── Logout ───────────────────────────────────────────────────────
  logout: async () => {
    // tell backend to invalidate the token
    try {
      await api.post("/auth/logout");
    } catch {
      // even if API call fails — still log out on frontend
      // user should never get stuck logged in
    } finally {
      localStorage.removeItem("token");
      // remove token so checkAuth won't restore the session

      set({
        user: null,
        isLoggedIn: false,
        error: null,
      });
      // every component re-renders
      // ProtectedLayout sees isLoggedIn = false → redirects to /login
    }
  },


  // ── Check Auth ───────────────────────────────────────────────────
  // runs ONCE when app first loads (in App.jsx useEffect)
  // checks if user already has a valid session from before
  checkAuth: async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      // no token in browser → definitely not logged in
      set({ isLoading: false });
      return;
    }

    // token exists — verify it with backend
    set({ isLoading: true });

    try {
      const { user } = await api.get("/auth/me");
      // backend reads token from header → returns user data
      // data = { id, name, email, plan, avatar }

      set({
        user,
        isLoggedIn: true,
      });
      // user is restored — they stay logged in after refresh ✅

    } catch {
      // token expired or invalid
      localStorage.removeItem("token");
      // clean up bad token

      set({
        user: null,
        isLoggedIn: false,
      });
      // ProtectedLayout will redirect to /login

    } finally {
      set({ isLoading: false });
    }
  },


  // ── Update Profile ───────────────────────────────────────────────
  updateProfile: async (profileData) => {
    // profileData = { name, avatar, timezone }

    set({ isLoading: true, error: null });

    try {
      const updatedUser = await api.put("/users/profile", profileData);

      set({
        user: updatedUser,
        // replace entire user object with updated version
      });

    } catch (err) {
      set({ error: err.message || "Update failed" });

    } finally {
      set({ isLoading: false });
    }
  },


  // ── Update Password ──────────────────────────────────────────────
  updatePassword: async (passwordData) => {
    // passwordData = { currentPassword, newPassword }

    set({ isLoading: true, error: null });

    try {
      await api.put("/users/password", passwordData);
      // no state to update — just confirm it worked

    } catch (err) {
      set({ error: err.message || "Password update failed" });
      // e.g. "Current password is incorrect"

    } finally {
      set({ isLoading: false });
    }
  },


  // ── Forgot Password ──────────────────────────────────────────────
  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });

    try {
      await api.post("/auth/forgot-password", { email });
      // backend sends reset email
      // we don't store anything — just let the component know it worked

    } catch (err) {
      set({ error: err.message || "Failed to send reset email" });

    } finally {
      set({ isLoading: false });
    }
  },


  // ── Reset Password ───────────────────────────────────────────────
  resetPassword: async (data) => {
    // data = { token: "from URL", newPassword: "newpass123" }

    set({ isLoading: true, error: null });

    try {
      await api.post("/auth/reset-password", data);
      // password updated on backend
      // redirect to login handled by the component

    } catch (err) {
      set({ error: err.message || "Failed to reset password" });

    } finally {
      set({ isLoading: false });
    }
  },


  // ── Set Error ──────────────────────────────────────────────────
  setError: (msg) => set({ error: msg }),

  // ── Clear Error ──────────────────────────────────────────────────
  // call this when user starts typing to clear old errors
  clearError: () => set({ error: null }),

}));

export default useAuthStore;