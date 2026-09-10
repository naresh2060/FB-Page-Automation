import { create } from 'zustand';
import { getFacebookPostList } from '../api/postApi';

const useFacebookStore = create((set, get)=>({
    facebookPosts:[],
    isLoading :false,
    isPublishing:false,
    error:null,

    // Fetch FB posts (fetching from facebook)
    fetchFacebookPosts: async()=>{
        set({isLoading:true});

        try{
            const res = await getFacebookPostList();

            const posts = (res?.posts || res?.data || []).map(p=>({
                id: p.id,
                content: p.message || p.story || '',
                imageUrl: p.full_picture,
                createdAt: p.created_time,
        likes: p.likes?.summary?.total_count || 0,
        comments: p.comments?.summary?.total_count || 0,
        shares: p.shares?.count || 0,
        permalink: p.permalink_url,
            }));
      set({ facebookPosts: posts, isLoading: false });
        }
        catch (err) {
      set({ error: err.message, isLoading: false });
    }
    },
}))



export default useFacebookStore;