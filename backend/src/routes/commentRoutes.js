import express from 'express';
import commentController from '../controllers/commentController.js';
import { verifyToken } from '../middlewares/auth.js';

const commentRouter = express.Router({ mergeParams: true });
commentRouter.get('/', commentController.getComments);
commentRouter.post('/', verifyToken, commentController.createComment);
commentRouter.delete('/:commentId', verifyToken, commentController.deleteComment);

export default commentRouter;
