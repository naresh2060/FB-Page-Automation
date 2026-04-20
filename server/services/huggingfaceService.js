import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HUGGING_FACE_API_KEY);

export const generateImage = async (prompt) => {
  try {
    const blob = await hf.textToImage({
      model: "black-forest-labs/FLUX.1-schnell",
    // model: "runwayml/stable-diffusion-v1-5",
      inputs: prompt,
      parameters: {
        width: 512,
        height: 512,
      }
    });

    const buffer = Buffer.from(await blob.arrayBuffer());
    const base64 = buffer.toString('base64');

    return {
      buffer,
      base64,
      contentType: 'image/png'
    };

  } catch (error) {
  console.error("HF SDK Error:", error);
  // Log the actual provider response body
  if (error?.httpResponse?.body) {
    console.error("Provider error detail:", JSON.stringify(error.httpResponse.body, null, 2));
  }
  throw new Error("Failed to generate image");
}
};