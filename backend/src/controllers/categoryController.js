import * as categoryService from '../services/categoryService.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.getAllCategories();
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Categories retrieved successfully',
    data: { categories }
  });
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  res.status(201).json({
    success: true,
    statusCode: 201,
    message: 'Category created successfully',
    data: { category }
  });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body);
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Category updated successfully',
    data: { category }
  });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(req.params.id);
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Category deleted successfully'
  });
});

export default {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
