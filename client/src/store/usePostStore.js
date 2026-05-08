import { create } from 'zustand';
import { generatePost, generateImage, getPosts, publishToFacebook, deletePost as deletePostApi, getPostInsightsApi } from '../api/postApi.js';

const usePostStore = create((set, get) => ({

    // ── Modal State ───────────────────────────────────────────────
    isCreateOpen: false,
    isPreviewOpen: false,

    // ── Data State ────────────────────────────────────────────────
    previewData: null,   // what backend returns — shown in RefineModal
    isLoading: false,
    error: null,
    isImageLoading: false,
    imageError: null,

    // ── Modal Actions ─────────────────────────────────────────────
    openCreate: () => set({ isCreateOpen: true, error: null }),
    closeCreate: () => set({ isCreateOpen: false, error: null }),
    closePreview: () => set({
        isPreviewOpen: false, previewData: null, isImageLoading: false,
        imageError: null,
    }),

    // ── Generate Post ─────────────────────────────────────────────
    // called when user clicks "Generate with AI" in CreatePostModal
    handleGenerate: async (formData) => {
        // formData = { topic }

        set({ isLoading: true, error: null });

        try {
            const data = await generatePost(formData);
            // data = { success: true, post: { ... } }

            set({
                previewData: data.post,       // save for RefineModal
                isCreateOpen: false,      // close CreateModal
                isPreviewOpen: true,       // open RefineModal
                isLoading: false,
            });

        } catch (err) {
            set({
                error: err.message || "Failed to generate post",
                isLoading: false,
                // isCreateOpen stays true — user can retry
            });
        }
    },

    // ── Generate Image ─────────────────────────────────────────────
    handleGenerateImage: async (imagePrompt) => {
        const { previewData } = get();
        
        set({ isImageLoading: true, imageError: null });

        try {
            const data = await generateImage({ 
                postId: previewData?._id, // MongoDB use _id
                imagePrompt: imagePrompt, 
            });
            // data = { imageUrl: "https://cloudinary.com/..." }

            set((state) => ({
                previewData: { ...state.previewData, imageUrl: data.imageUrl },
                isImageLoading: false,
            }));

        } catch (err) {
            set({
                imageError: err.message || "Failed to generate image",
                isImageLoading: false,
            });
        }
    },


    // ── Posts Data ────────────────────────────────────────────────
    posts: [],
    pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    isFetchingPosts: false,
    fetchPostsError: null,

    fetchPosts: async (params = {}) => {
        set({ isFetchingPosts: true, fetchPostsError: null });
        try {
            const data = await getPosts(params);
            set({
                posts: data.posts,
                pagination: data.pagination,
                isFetchingPosts: false
            });
        } catch (err) {
            set({
                fetchPostsError: err.message || "Failed to fetch posts",
                isFetchingPosts: false
            });
        }
    },

    // ── Publish to Facebook ────────────────────────────────────────
    isPublishing: false,
    publishToFacebook: async (postId, isRepost = false) => {
        set({ isPublishing: true });
        try {
            const data = await publishToFacebook(postId, isRepost);
            // Update the local post status so the UI reflects immediately
            set((state) => {
                let newPosts;
                if (data.isNewPost && data.post) {
                    // It's a repost, so a new post was created. Prepend it to the list.
                    newPosts = [data.post, ...state.posts];
                } else {
                    // It's a regular publish, update the existing post.
                    newPosts = state.posts.map((p) =>
                        p._id === postId ? { ...p, status: 'posted', postedAt: new Date().toISOString() } : p
                    );
                }
                return {
                    posts: newPosts,
                    isPublishing: false,
                };
            });
            return { success: true, message: data.message || 'Published successfully' };
        } catch (err) {
            set({ isPublishing: false });
            return {
                success: false,
                message: err.error || err.message || 'Failed to publish to Facebook',
            };
        }
    },

    // ── Delete Post ────────────────────────────────────────────────
    isDeleting: false,
    deletePost: async (postId) => {
        set({ isDeleting: true });
        try {
            await deletePostApi(postId);
            set((state) => ({
                posts: state.posts.filter((p) => p._id !== postId),
                isDeleting: false,
            }));
            return { success: true, message: 'Post deleted successfully' };
        } catch (err) {
            set({ isDeleting: false });
            return {
                success: false,
                message: err.error || err.message || 'Failed to delete post',
            };
        }
    },
    // ── Post Insights ──────────────────────────────────────────────
    isFetchingInsights: false,
    fetchPostInsights: async (fbPostId) => {
        set({ isFetchingInsights: true });
        try {
            const data = await getPostInsightsApi(fbPostId);
            // data = { success: true, insights: { impressions: X, clicks: Y, etc } }
            
            // Update the post in the store with new insight data
            set((state) => ({
                posts: state.posts.map((p) => 
                    p.facebookPostId === fbPostId ? { ...p, views: data.insights?.post_impressions?.[0]?.value || 0 } : p
                ),
                isFetchingInsights: false
            }));
            return { success: true, insights: data.insights };
        } catch (err) {
            set({ isFetchingInsights: false });
            return { success: false, message: err.message };
        }
    },
}));

export default usePostStore;