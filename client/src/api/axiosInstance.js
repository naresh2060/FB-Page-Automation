import axios from "axios";
import useAuthStore from "../store/useAuthStore";

const apiVersion = import.meta.env.VITE_API_VERSION || 'v1';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/${apiVersion}`,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor ─────────────────────────────
// Automatically attaches token to EVERY request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor ────────────────────────────
// Handles errors globally so you don't repeat this in every api file
api.interceptors.response.use(
  (response) => response.data,   // 👈 returns data directly, not response.data every time

  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;

    // Don't auto-logout on 401 for Facebook connection endpoint
    // (401 here means Facebook token issues, not JWT issues)
    if (status === 401 && !url?.includes('/facebook/connect') && !url?.includes('/check-fb-connection')) {
      // token expired → log out automatically
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }

    if (!error.response) {
      console.error("Network Error: Please check if the backend server is running and accessible at " + api.defaults.baseURL);
    }

    if (status === 403) {
      console.error("You don't have permission");
    }

    if (status === 500) {
      console.error("Server error");
    }

    return Promise.reject(error.response?.data || error);
  }
);

export default api;