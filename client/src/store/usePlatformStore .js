import { create } from "zustand";
import api from "../api/axiosInstance";

const usePlatformStore = create((set) => ({

  // ── State ────────────────────────────────────────────────────
  status: "idle",      // idle | checking | connected | failed
  pageInfo:  null,
  tokenInfo: null,
  error:     null,

  // ── Actions ──────────────────────────────────────────────────
  checkFacebook: async ({ pageId, accessToken }) => {
    set({ status: "checking", error: null, pageInfo: null, tokenInfo: null });
    try {
      const data = await api.post("/platforms/check-fb-connection", {
        pageId,
        accessToken,
      });
      set({
        status:    "connected",
        pageInfo:  data.page,
        tokenInfo: data.token,
      });
    } catch (err) {
      set({
        status: "failed",
        error: {
          code:          err.error   || "UNKNOWN_ERROR",
          message:       err.message || "Connection failed",
          hint:          err.hint    || null,
          missingScopes: err.missingScopes || null,
          expiredAt:     err.expiredAt     || null,
        },
      });
    }
  },

  reset: () => set({
    status:    "idle",
    pageInfo:  null,
    tokenInfo: null,
    error:     null,
  }),
}));

export default usePlatformStore;