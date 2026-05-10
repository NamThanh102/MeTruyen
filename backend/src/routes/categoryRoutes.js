import express from 'express';
import categoryController from '../controllers/categoryController.js';
import { verifyToken, isAdmin } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', categoryController.getAllCategories);
router.post('/', verifyToken, isAdmin, categoryController.createCategory);
router.put('/:id', verifyToken, isAdmin, categoryController.updateCategory);
router.delete('/:id', verifyToken, isAdmin, categoryController.deleteCategory);

export default router;