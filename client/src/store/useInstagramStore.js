import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axiosInstance';
import { getInstagramPostist } from '../api/instagramApi';

const useInstagramStore = create(
  persist(
    (set, get) => ({
      status: 'idle', // idle | checking | connected | failed
      error: null,
      pageData: null,

      connectInstagram: async ({ pageId, accessToken }) => {
        set({ status: 'checking', error: null });

        try {
          const res = await api.post('/instagram/add', {
            pageId,
            accessToken,
          });

          set({
            status: 'connected',
            pageData: res.data?.data || res.data,
            error: null,
          });
          return { success: true, data: res.data };
        } catch (err) {
          const errorData = {
            code: err.response?.data?.code || err.code || 'UNKNOWN_ERROR',
            message: err.response?.data?.message || err.message || 'Connection failed',
            hint: err.response?.data?.hint || null,
            missingScope: err.response?.data?.missingScope || null,
            expiredAt: err.response?.data?.expiredAt || null,
          };
          set({
            status: 'failed',
            error: errorData,
          });
          return { success: false, error: errorData };
        }
      },

      disconnect: () =>
        set({
          status: 'idle',
          pageData: null,
          error: null,
        }),

      reset: () =>
        set({
          status: 'idle',
          error: null,
        }),

      isConnected: () => get().status === 'connected' && get().pageData !== null,

      instagramPostList: [],
      instagramPostListLoading: false,
      instagramPostListError: null,

      fetchInstagramPostList: async () => {
        set({ instagramPostListLoading: true, instagramPostListError: null });

        try {
          const res = await getInstagramPostist();
          const posts = (res.data?.data || res?.data || []).map(p => ({
            id: p.id,
            caption: p.caption,
            media_url: p.media_url,
            media_type: p.media_type,
            thumbnail_url: p.thumbnail_url,
            permalink: p.permalink,
            timestamp: p.timestamp,
          }));
          set({ instagramPostList: posts, instagramPostListLoading: false, instagramPostListError: null })

        } catch (err) {
          set({
            instagramPostListError: err.message, instagramPostListLoading: false
          })
        }
      }




    }),
    {
      name: 'ig-platform',
      partialize: (state) => ({
        status: state.status,
        pageData: state.pageData,
      }),
    }
  )
);

export default useInstagramStore;