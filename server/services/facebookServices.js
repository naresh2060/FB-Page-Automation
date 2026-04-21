import axios from 'axios';
import FormData from 'form-data';

const PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const BASE_URL = `https://graph.facebook.com/v18.0`;

// ─── Upload Photo (unpublished) ───────────────────────────────────────────────
export const uploadPhoto = async (imageBuffer) => {
    try {
        const formData = new FormData();
        formData.append('source', imageBuffer, {
            filename: 'image.png',
            contentType: 'image/png',
        });
        formData.append('published', 'false');      // store privately, don't post yet
        formData.append('access_token', ACCESS_TOKEN);

        const response = await axios.post(
            `${BASE_URL}/${PAGE_ID}/photos`,
            formData,
            {
                headers: {
                    ...formData.getHeaders()        // sets correct multipart/form-data headers
                }
            }
        );

        const photoId = response.data.id;
        console.log("Photo uploaded to Facebook, photoId:", photoId);
        return photoId;

    } catch (error) {
        console.error('Facebook Photo Upload Error:', error.response?.data || error.message);
        throw new Error('Failed to upload photo to Facebook');
    }
};

// ─── Post to Page (with or without image) ────────────────────────────────────
export const postToPage = async (content, photoId = null) => {
    try {
        const payload = {
            message: content,
        };

        // Only attach image if photoId exists
        if (photoId) {
            payload.attached_media = [{ media_fbid: photoId }];
        }

        const response = await axios.post(
            `${BASE_URL}/${PAGE_ID}/feed`,
            payload,
            {
                params: {
                    access_token: ACCESS_TOKEN
                }
            }
        );

        const facebookPostId = response.data.id;
        console.log("Posted to Facebook, postId:", facebookPostId);
        return facebookPostId;

    } catch (error) {
        console.error('Facebook Post Error:', error.response?.data || error.message);
        throw new Error('Failed to post to Facebook');
    }
};