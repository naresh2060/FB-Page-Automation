import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// 🔁 Retry helper (handles 429 / 503)
const retryRequest = async (fn, retries = 3, delayMs = 2000) => {
  try {
    return await fn();
  } catch (error) {
    const is503 = error?.status === 503 || error?.message?.includes('503');

    if (retries > 0 && is503) {
      console.log(`Retrying in ${delayMs / 1000}s... (${retries} left)`);
      await new Promise(res => setTimeout(res, delayMs)); // ✅ wait before retry
      return retryRequest(fn, retries - 1, delayMs * 2); // ✅ exponential backoff
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
You are an elite Facebook growth strategist and viral content architect with deep expertise in Meta's algorithm, social SEO, and mass engagement psychology.

Create a VIRAL, SEO-optimized Facebook post AND a detailed AI image generation prompt for the topic: "${topic}"

STRICT FORMAT (very important):
Return ONLY valid JSON — no markdown, no backticks, no preamble:
{
  "content": "...",
  "imagePrompt": "..."
}

━━━━━━━━━━━━━━━━━━━━━━━━━━
FACEBOOK POST RULES (content)
━━━━━━━━━━━━━━━━━━━━━━━━━━

META ALGORITHM PRIORITIES (write with these in mind):
- Posts with early comment engagement rank highest — engineer the post to trigger comments within the first 30 minutes
- Facebook SEO reads first 18 words as the "meta title" — front-load your primary keyword naturally
- Posts with 3+ paragraphs and meaningful reactions outperform one-liners
- Native content (no external links in post body) gets 5x more reach
- Posts that ask explicit questions get 2x more comments — use them strategically

STRUCTURE (follow this exact order):

1. SEO HOOK — Line 1 (THE MOST IMPORTANT LINE):
   - Must contain the primary keyword naturally in the first 10 words
   - Use a pattern interrupt: shocking stat, bold claim, or polarizing question
   - 10–15 words max
   - Triggers curiosity gap — do NOT complete the thought
   - Examples:
     "Most people will never know the real secret behind [topic] — here's why 👇"
     "This one [topic] mistake is silently costing you everything. Did you know?"

2. BLANK LINE

3. INTRIGUE BRIDGE (1–2 lines):
   - Validate the reader's pain point or desire
   - Make them feel SEEN and understood
   - No solution yet — build tension

4. BLANK LINE

5. STORY BODY (3 short paragraphs, 2–3 lines each):
   - Open with a relatable micro-story or real-world scenario
   - Paragraph 2: introduce the insight or turning point
   - Paragraph 3: connect the insight to the reader's life
   - Use "you/your" language exclusively
   - Max 15 words per sentence — short, punchy, rhythmic
   - Blank line between every paragraph
   - Use ONE emoji per paragraph max, placed at end of paragraph

6. BLANK LINE

7. VALUE BULLETS (the "Save-worthy" section):
   Use this exact format:
   ✅ [Specific actionable insight #1]
   ✅ [Specific actionable insight #2]
   ✅ [Specific actionable insight #3]
   ✅ [Specific actionable insight #4]
   - These should be concrete, quotable, and share-worthy on their own
   - People screenshot and share bullet sections — make them count

8. BLANK LINE

9. ENGAGEMENT TRIGGER (pick the highest-friction CTA for the topic):
   OPTION A — Opinion split (maximum comments):
     "Do you agree or disagree? Comment YES or NO 👇"
   OPTION B — Tag mechanic (maximum shares):
     "Tag someone who needs to hear this RIGHT NOW 👇"
   OPTION C — Save prompt (maximum reach longevity):
     "Save this post — you'll want to come back to it 🔖"
   OPTION D — Completion hook:
     "Type DONE when you've read this fully — I read every comment ❤️"
   → Choose the ONE best fit for the topic. Do not stack all options.

10. BLANK LINE

11. HASHTAG BLOCK:
    - Exactly 10 hashtags
    - Formula: 2 ultra-broad (#Success #Motivation), 4 niche-specific, 2 trending/seasonal, 2 community tags (#[Topic]Community #[Topic]Tips)
    - All on one line
    - Place AFTER a blank line separator

━━━━━━━━━━━━━━━━━━━━━━━━━━
ADVANCED SEO & VIRALITY RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━
- Total word count: 190–230 words (optimal for Facebook's feed display)
- Keyword density: Use the core topic word/phrase 3–4 times naturally
- Power words to use: Discover, Proven, Secret, Transform, Finally, Exact, Warning, Unlock
- Avoid: External URLs, "link in bio", passive voice, complex vocabulary
- Write at a 6th–8th grade reading level (Flesch-Kincaid friendly)
- Emotional arc: Curiosity → Empathy → Insight → Action
- First comment strategy: End post body with a soft teaser like "The #1 tip is in the comments 👇" to boost comment count (then imagine that tip as a reply)

━━━━━━━━━━━━━━━━━━━━━━━━━━
IMAGE PROMPT RULES (imagePrompt)
━━━━━━━━━━━━━━━━━━━━━━━━━━

STRUCTURE:
[Main Subject] + [Scene/Environment] + [Mood/Lighting] + [Style] + [Quality Tags]

RULES:
- 70–90 words
- Hyper-specific — no vague terms like "beautiful" or "nice"
- Specify exact lighting (golden hour rim light, cool studio softbox, dramatic chiaroscuro)
- Specify art direction (cinematic realism, editorial photography, 4K digital art)
- Include color grading / mood palette (warm amber tones, desaturated moodboard, vibrant high-contrast)
- Specify camera angle and lens feel (wide-angle environmental, tight portrait 85mm, overhead flat lay)
- Make it THUMB-STOPPING — the image must create curiosity or emotion on its own
- End with: "highly detailed, sharp focus, photorealistic, professional grade"
- NEVER use abstract or conceptual descriptions — only concrete visual elements

EXAMPLE FORMAT:
"A determined young woman standing at a sunlit open window overlooking a vast city skyline,
morning golden-hour light casting warm amber streaks across her face and shoulder,
shallow depth of field with soft bokeh background,
cinematic editorial photography style, rich warm earth tones,
close-up portrait framing at slight upward angle,
highly detailed, sharp focus, photorealistic, professional grade"
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