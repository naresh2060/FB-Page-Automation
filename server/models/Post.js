import mongoose from 'mongoose';
const postSchema     = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    platform: {
      type: String,
      default: 'facebook'
    },
    topic: {
    type: String,
    required: true,
    trim: true
  },
  theme: String,
  content: {
    type: String,
    required: false
  },
  imageUrl: {
    type: String,
    required: false
  },
  imagePrompt: String,
  facebookPostId: String,
  status: {
    type: String,
    enum: ['pending', 'posted', 'failed', 'draft'],
    default: 'pending'
  },
  error: String,
  postedAt: Date
},{
    timestamps : true
});
const Post = mongoose.model('Post', postSchema)

export default Post
