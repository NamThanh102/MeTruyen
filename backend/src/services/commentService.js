import Comment from '../models/Comment.js';
import Comic from '../models/Comic.js';
import Chapter from '../models/Chapter.js';
import { AppError } from '../middlewares/errorHandler.js';

export const getComments = async ({ comicId, chapterId, page = 1, limit = 20 }) => {
  const filter = { comicId };
  if (chapterId) filter.chapterId = chapterId;

  const parsedPage = parseInt(page, 10);
  const parsedLimit = parseInt(limit, 10);
  const skip = (parsedPage - 1) * parsedLimit;

  const [comments, total] = await Promise.all([
    Comment.find(filter)
      .populate('userId', 'username avatar displayName')
      .populate('chapterId', 'chapterNumber title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .lean(),
    Comment.countDocuments(filter)
  ]);

  return {
    comments,
    pagination: {
      currentPage: parsedPage,
      totalPages: Math.ceil(total / parsedLimit),
      totalComments: total,
      limit: parsedLimit
    }
  };
};

export const createComment = async ({ comicId, chapterId, userId, content }) => {
  if (!content || !content.trim()) {
    throw new AppError('Nội dung bình luận không được để trống', 400);
  }

  if (!comicId) {
    throw new AppError('Comic ID là bắt buộc', 400);
  }

  const comic = await Comic.findById(comicId);
  if (!comic) {
    throw new AppError('Truyện không tồn tại', 404);
  }

  if (chapterId) {
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      throw new AppError('Chapter không tồn tại', 404);
    }
  }

  const comment = await Comment.create({
    comicId,
    chapterId: chapterId || null,
    userId,
    content: content.trim()
  });

  return Comment.findById(comment._id)
    .populate('userId', 'username avatar displayName')
    .populate('chapterId', 'chapterNumber title');
};

export const deleteComment = async (commentId, currentUser) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new AppError('Bình luận không tồn tại', 404);
  }

  if (comment.userId.toString() !== currentUser._id.toString() && currentUser.role !== 'admin') {
    throw new AppError('Bạn không có quyền xóa bình luận này', 403);
  }

  await comment.deleteOne();
  return true;
};

export default {
  getComments,
  createComment,
  deleteComment
};
