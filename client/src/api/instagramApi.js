import api from "./axiosInstance";

export const getInstagramPostist = (params = {}) => api.get("/instagram/posts");