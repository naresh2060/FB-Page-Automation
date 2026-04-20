import axios from 'axios';
import FormData from 'form-data';

export const postToPage = async (content, photoId = null) => {
    try {
        const payload = {
            message: content,
        };

        //Only attach image if photoId exists
        if (photoId) {
            payload.attached_media = [{ media_fbid: photoId }];
        }
        const response = await axios.post(
            `https://graph.facebook.com/v18.0/${process.env.FACEBOOK_PAGE_ID}/feed`,
            payload,
            {
                params: {
                    access_token: process.env.FACEBOOK_ACCESS_TOKEN
                }
            }
        );
        return response.data.id;
    } catch (error) {
        console.error('Facebook Post Error:', error.response?.data || error.message);
        throw new Error('Failed to post to Facebook');
    }
}