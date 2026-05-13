import api from './axiosInstance.js';

export const generatePost = (data) => api.post('/api/posts/generate', data);
export const generateImage = (data) => api.post('/api/posts/generate-image', data);
// data = { postId, imagePrompt }
// returns { imageUrl: "https://cloudinary.com/..." }

export const publishToFacebook = (postId, isRepost = false) => api.post('/api/facebook/posts/publish', { postId, isRepost });

export const deletePost = (postId) => api.delete(`/api/posts/${postId}`);

// export const getPosts = (params) => api.get('/api/posts', { params });
export const getPosts = async (params = {}) => {
  const { page = 1, limit = 10 } = params;
  const data = await api.get(`/api/posts?page=${page}&limit=${limit}`);
  return data;
};

export const updatePost = (postId, data) => api.put(`/api/posts/${postId}`, data);
export const createPost = (data) => api.post('/api/posts', data);

export const getPostInsightsApi = (fbPostId) => api.get(`/api/facebook/analytics/post/${fbPostId}`);
