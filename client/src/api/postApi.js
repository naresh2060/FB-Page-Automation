import api from './axiosInstance.js';


const API_VERSION = import.meta.env.API_VERSION  || 'v1';



export const generatePost = (data) => api.post('/posts/generate', data);
export const generateImage = (data) => api.post('/posts/generate-image', data);
// data = { postId, imagePrompt }
// returns { imageUrl: "https://cloudinary.com/..." }

export const publishToFacebook = (postId, isRepost = false) => api.post('/facebook/posts/publish', { postId, isRepost });

export const deletePost = (postId) => api.delete(`/posts/${postId}`);

// export const getPosts = (params) => api.get('/posts', { params });
export const getPosts = async (params = {}) => {
  const { page = 1, limit = 10 } = params;
  const data = await api.get(`/post?page=${page}&limit=${limit}`);
  return data;
};

export const updatePost = (postId, data) => api.put(`/posts/${postId}`, data);
export const createPost = (data) => api.post('/posts', data);

export const getPostInsightsApi = (fbPostId) => api.get(`/facebook/analytics/post/${fbPostId}`);

export const getFacebookPostList = (params = {}) =>
  api.get('/api/v1/facebook/postlist', { params });
