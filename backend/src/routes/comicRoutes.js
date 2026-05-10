import express from 'express';
import comicController from '../controllers/comicController.js';
import chapterController from '../controllers/chapterController.js';
import { verifyToken, isAdmin } from '../middlewares/auth.js';
import { uploadSingle, uploadMultiple } from '../middlewares/upload.js';

const router = express.Router();

router.get('/', comicController.getAllComics);
router.get('/slug/:slug', comicController.getComicBySlug);
router.get('/slug/:slug/chapters', comicController.getChaptersBySlug);
router.get('/:id/chapters', comicController.getChaptersByComicId);
router.get('/:id', comicController.getComicById);
router.post('/:id/view', comicController.increaseView);

router.post(
  '/',
  verifyToken,
  isAdmin,
  uploadSingle('coverImage'),
  comicController.createComic
);

router.put(
  '/:id',
  verifyToken,
  isAdmin,
  uploadSingle('coverImage'),
  comicController.updateComic
);

router.delete('/:id', verifyToken, isAdmin, comicController.deleteComic);

router.post(
  '/:comicId/chapters',
  verifyToken,
  isAdmin,
  uploadMultiple('pages', 100),
  chapterController.createChapter
);

export default router;
