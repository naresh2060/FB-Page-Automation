// client/src/api/platformApi.js
import api from './axiosInstance.js';

export const addFacebook = (data) => api.post("/platforms/facebook/add", data);

export const getFacebookPostList = (params = {}) =>
  api.get('/facebook/postlist', { params })