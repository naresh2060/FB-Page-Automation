import mongoose from 'mongoose';
const postSchema     = new mongoose.Schema({
    topic: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: false
  },
  imagePrompt: String,
  facebookPostId: String,
  status: {
    type: String,
    enum: ['pending', 'posted', 'failed'],
    default: 'pending'
  },
  error: String,
  postedAt: Date
},{
    timestamps : true
});
const Post = mongoose.model('Post', postSchema)

export default Post
