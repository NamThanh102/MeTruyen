import express from 'express';
import chapterController from '../controllers/chapterController.js';
import { verifyToken, isAdmin, optionalAuth } from '../middlewares/auth.js';
import { uploadMultiple } from '../middlewares/upload.js';

const router = express.Router();

router.get('/:id', optionalAuth, chapterController.getChapterById);
router.put('/:id', verifyToken, isAdmin, uploadMultiple('pages', 100), chapterController.updateChapter);
router.delete('/:id', verifyToken, isAdmin, chapterController.deleteChapter);

export default router;
