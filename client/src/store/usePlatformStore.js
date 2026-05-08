import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../api/axiosInstance";
// import { connect } from "mongoose";

const usePlatformStore = create(
  persist(
    (set, get) => ({

      // ── State ────────────────────────────────────────────────
      status: "idle",   // idle | checking | connected | failed
      pageInfo: null,     // { id, name, category, fanCount, picture, verified, link }
      tokenInfo: null,     // { scopes, expiresAt, isLongLived }
      error: null,

      // ── Check & connect Facebook ─────────────────────────────
      connectFacebook: async ({ pageId, accessToken }) => {
        set({ status: "checking", error: null, pageInfo: null, tokenInfo: null });
        try {
          const data = await api.post("/api/facebook/add", {
            pageId,
            accessToken,
          });

          // data.page  → { id, name, category, fanCount, picture, verified, link }
          // data.token → { scopes, expiresAt, isLongLived }
          set({
            status: "connected",
            pageInfo: data.page,
            tokenInfo: data.token,
            error: null,
          });

        } catch (err) {
          set({
            status: "failed",
            error: {
              code: err.error || "UNKNOWN_ERROR",
              message: err.message || "Connection failed",
              hint: err.hint || null,
              missingScopes: err.missingScopes || null,
              expiredAt: err.expiredAt || null,
            },
            pageInfo: null,
            tokenInfo: null,
          });
        }
      },

      

      fetchFacebookPage: async () => {
        set({ loading: true, error: null });

        try {
          const res = await api.get("/api/facebook/getPage  ");

          const data = res.data;

          set({
            pageInfo: data.page,
            status: "connected",
            loading: false,
            error: null,
          });

        } catch (err) {
          set({
            loading: false,
            error: {
              message: err?.response?.data?.message || "Failed to fetch page",
            },
          });
        }
      },
      // ── Disconnect ───────────────────────────────────────────
      disconnect: () => set({
        status: "idle",
        pageInfo: null,
        tokenInfo: null,
        error: null,
      }),

      // ── Reset (for modal close / re-open) ───────────────────
      reset: () => set({
        status: "idle",
        pageInfo: null,
        tokenInfo: null,
        error: null,
      }),

      // ── Helpers ──────────────────────────────────────────────
      isConnected: () => get().status === "connected" && get().pageInfo !== null,
    }),

    {
      name: "fb-platform",           // localStorage key
      partialize: (state) => ({
        // Only persist these — not loading/error states
        status: state.status,
        pageInfo: state.pageInfo,
        tokenInfo: state.tokenInfo,
      }),
    }
  )
);

export default usePlatformStore;