import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });



export const generatePostContent = async (topic) => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Create an engaging Facebook post about "${topic}". 
        
        Requirements:
        - Keep it under 250 words
        - Make it engaging and shareable
        - Include relevant hashtags
        - Use emojis appropriately
        - Write in a friendly, conversational tone
        
        Return ONLY the post text, nothing else.`,
        });

        return response.text;

    } catch (error) {
        console.error("Error generating post:", error);
        throw error;
    }
}

export const generateImagePrompt = async (topic) =>{
    try {
        const response = await ai.models.generateContent({
            model : "gemini-3-flash-preview",
            contents: `Create a detailed image generation prompt for the topic: "${topic}".
        
        The prompt should:
        - Be visually descriptive
        - Specify style (e.g., modern, minimalist, vibrant)
        - Include relevant elements and composition
        - Be suitable for social media
        - Be under 100 words
        
        Return ONLY the image prompt, nothing else.`
        })
         return response.text; 
    } catch(error) {
        console.error("Error generating Image Prompt:", error);
        throw error;
    }
}