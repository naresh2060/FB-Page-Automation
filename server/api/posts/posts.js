import express from 'express';
import Post from '../../models/Post.js'

import { generatePostContent, generateImagePrompt } from '../../services/geminiService.js'
import { postToPage } from '../../services/facebookServices.js';
import { generateImage } from '../../services/huggingfaceService.js';

const router = express.Router();

router.post('/generate', async (req, res) => {
  let post;
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }
    //Create inital post record
    post = new Post({ topic, content: '', imageUrl: '' })

    //step 1: Generate Post content
    console.log("Generating post content...");
    const content = await generatePostContent(topic);

    if (!content) {
      throw new Error("Failed to generate post content");
    }
    console.log(`Content: ${content}`);
    post.content = content;

    //step 2: Generate Image Prompt
    // const imagePrompt = await generateImagePrompt(topic);
    // post.imagePrompt = imagePrompt;
    // console.log(`Image prompt: ${imagePrompt}`);

    //step 3: Generate Image
    // console.log("Generating Image...");
    // const image = await generateImage(imagePrompt);


    //step 4:  Upload to facebook
    // console.log("Uploading to Facebook...");
    // const photoId = await uploadPhoto(image.buffer);

    //step 5: Post to facebook
    console.log("Posting to Facebook Page...");
    const facebookPostId = await postToPage(content);

    //Update post record
    post.facebookPostId = facebookPostId;
    // post.imageUrl = `data:image/png;base64,${image.base64}`;
    post.status = 'posted';
    post.postedAt = new Date();

    await post.save();


    res.json({
      success: true,
      message: 'Post created and published successfully!',
      post: {
        id: post._id,
        topic: post.topic,
        content: post.content,
        imageUrl: post.imageUrl,
        facebookPostId: post.facebookPostId,
        status: post.status
      }
    });
  } catch (error) {
    console.error("Error in /generate:", error);

    // Save failed post if we have a post object
    if (post) {
      post.status = 'failed';
      post.error = error.message;
      await post.save();
    }

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/', (req, res) => {
  return res.json({ "topic": "All Posts here" })
})


export default router;