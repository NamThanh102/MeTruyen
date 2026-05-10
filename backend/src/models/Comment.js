import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  comicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comic',
    required: [true, 'Comic ID is required'],
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  chapterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter',
    default: null
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
    maxlength: 1000
  }
}, {
  timestamps: true,
  collection: 'comments'
});

commentSchema.index({ comicId: 1, createdAt: -1 });
commentSchema.index({ chapterId: 1, createdAt: -1 });

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;
