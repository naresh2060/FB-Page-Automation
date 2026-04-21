import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// 🔁 Retry helper (handles 429 / 503)
const retryRequest = async (fn, retries = 3, delay = 2000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && (error.status === 429 || error.status === 503)) {
      console.log(`Retrying... (${retries} left)`);
      await new Promise(res => setTimeout(res, delay));
      return retryRequest(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

// ✅ SINGLE FUNCTION (content + image prompt)
export const generatePostAndPrompt = async (topic) => {
  try {
    const response = await retryRequest(() =>
      ai.models.generateContent({
        model: "models/gemini-2.5-flash",
        contents: `
Create BOTH a Facebook post AND an AI image prompt for the topic: "${topic}"

STRICT FORMAT (very important):
Return ONLY valid JSON like this:
{
  "content": "...",
  "imagePrompt": "..."
}

CONTENT RULES:
- 150–200 words
- Engaging, emotional, shareable
- Include 4–6 hashtags
- Use emojis naturally

IMAGE PROMPT RULES:
- Under 80 words
- Highly visual and descriptive
- Include subject, scene, mood
- Mention style (digital art, cinematic, etc.)
`
      })
    );

    let rawText = response.text.trim();
    rawText = rawText.replace(/```json|```/g, "").trim();

    // 🔥 Parse JSON safely
    let data;
    try {
      data = JSON.parse(rawText);
    } catch (err) {
      console.error("JSON parse error:", response.text);
      throw new Error("Invalid AI response format");
    }

     // ✅ Extra safety (prevents mongoose error)
    if (!data.content || !data.imagePrompt) {
      throw new Error("Incomplete AI response");
    }

    return data;

  } catch (error) {
    console.error("Error generating post + prompt:", error);
    throw new Error("Failed to generate content and prompt");
  }
};