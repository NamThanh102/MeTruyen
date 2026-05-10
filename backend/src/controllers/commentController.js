import * as commentService from '../services/commentService.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getComments = asyncHandler(async (req, res) => {
  const { comments, pagination } = await commentService.getComments({
    comicId: req.params.comicId,
    chapterId: req.query.chapterId,
    page: req.query.page,
    limit: req.query.limit
  });

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Comments retrieved',
    data: { comments, pagination }
  });
});

export const createComment = asyncHandler(async (req, res) => {
  const comment = await commentService.createComment({
    comicId: req.params.comicId || req.body.comicId,
    chapterId: req.body.chapterId,
    userId: req.user._id,
    content: req.body.content
  });

  res.status(201).json({
    success: true,
    statusCode: 201,
    message: 'Bình luận thành công',
    data: { comment }
  });
});

export const deleteComment = asyncHandler(async (req, res) => {
  await commentService.deleteComment(req.params.commentId, req.user);
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Xóa bình luận thành công'
  });
});

export default {
  getComments,
  createComment,
  deleteComment
};
