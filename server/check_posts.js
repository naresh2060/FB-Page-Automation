import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../server/.env') });

import Post from '../../server/models/Post.js';

async function checkPosts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const posts = await Post.find({ facebookPostId: { $ne: null } }).limit(10);
    console.log('Found posts:', posts.length);
    posts.forEach(p => {
      console.log(`Topic: ${p.topic}, FB ID: ${p.facebookPostId}`);
    });
    
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

checkPosts();
