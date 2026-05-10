import Category from '../models/Category.js';
import Comic from '../models/Comic.js';
import { AppError } from '../middlewares/errorHandler.js';

export const getAllCategories = async () => {
  return Category.find()
    .select('name slug description icon order comicCount')
    .sort({ order: 1, name: 1 })
    .lean();
};

export const createCategory = async (data) => {
  const { name, description, icon, order } = data;

  if (!name) {
    throw new AppError('Tên thể loại là bắt buộc', 400);
  }

  return Category.create({
    name,
    description,
    icon,
    order: order || 0
  });
};

export const updateCategory = async (id, data) => {
  const category = await Category.findByIdAndUpdate(id, data, {
    returnDocument: 'after',
    runValidators: true
  });

  if (!category) {
    throw new AppError('Thể loại không tồn tại', 404);
  }

  return category;
};

export const deleteCategory = async (id) => {
  const category = await Category.findById(id);
  if (!category) {
    throw new AppError('Thể loại không tồn tại', 404);
  }

  await Comic.updateMany(
    { categories: category._id },
    { $pull: { categories: category._id } }
  );

  await Category.deleteOne({ _id: category._id });
  return true;
};

export default {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
