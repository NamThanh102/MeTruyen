import express from 'express';
import userController from '../controllers/userController.js';
import { verifyToken, isAdmin } from '../middlewares/auth.js';

const router = express.Router();

router.use(verifyToken, isAdmin);

router.get('/stats', userController.getStats);
router.get('/payments', userController.getAdminPayments);
router.put('/payments/:paymentId', userController.updateAdminPayment);
router.delete('/payments/:paymentId', userController.deleteAdminPayment);
router.get('/users', userController.getAllUsers);
router.put('/users/:userId', userController.updateUserByAdmin);
router.put('/users/:userId/password', userController.changeUserPasswordByAdmin);
router.delete('/users/:userId', userController.deleteUser);

export default router;
