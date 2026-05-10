import express from 'express';
import userController from '../controllers/userController.js';
import { verifyToken, isAdmin } from '../middlewares/auth.js';
import { uploadSingle } from '../middlewares/upload.js';

const router = express.Router();

router.use(verifyToken);

router.get('/profile', userController.getProfile);
router.put('/profile', uploadSingle('avatar'), userController.updateProfile);
router.put('/password', userController.changePassword);

router.get('/library', userController.getLibrary);
router.post('/library/bookmark/:comicId', userController.toggleBookmark);
router.post('/library/history/:chapterId', userController.addToHistory);

router.post('/upgrade-vip', userController.upgradeVIP);
router.post('/recharge-mpoints', userController.rechargeMPoints);

export default router;
