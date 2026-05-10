import Comic from '../models/Comic.js';
import Chapter from '../models/Chapter.js';
import Category from '../models/Category.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import { AppError } from '../middlewares/errorHandler.js';
import mongoose from 'mongoose';

export const getComicsList = async (queryParams) => {
  const {
    page = 1,
    limit = 20,
    search,
    category,
    status,
    sort = '-lastChapterUpdate',
    all
  } = queryParams;

  const query = {};

  if (!all) {
    query.isPublished = true;
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { author: { $regex: search, $options: 'i' } }
    ];
  }

  if (category) {
    if (mongoose.Types.ObjectId.isValid(category)) {
      query.categories = category;
    } else {
      const categoryDoc = await Category.findOne({ slug: category }).select('_id').lean();
      query.categories = categoryDoc?._id || null;
    }
  }

  if (status) {
    query.status = status;
  }

  const parsedLimit = parseInt(limit, 10);
  const parsedPage = parseInt(page, 10);
  const skip = (parsedPage - 1) * parsedLimit;

  const [comics, totalComics] = await Promise.all([
    Comic.find(query)
      .select('title slug coverImage author categories status statistics lastChapterUpdate')
      .populate('categories', 'name slug icon')
      .sort(sort)
      .limit(parsedLimit)
      .skip(skip)
      .lean(),
    Comic.countDocuments(query)
  ]);

  return {
    comics,
    pagination: {
      currentPage: parsedPage,
      totalPages: Math.ceil(totalComics / parsedLimit),
      totalItems: totalComics,
      itemsPerPage: parsedLimit
    }
  };
};

export const getComicBySlug = async (slug) => {
  const comic = await Comic.findOne({ slug, isPublished: true })
    .populate('categories', 'name slug icon')
    .populate('createdBy', 'username displayName');

  if (!comic) {
    throw new AppError('Truyện không tồn tại', 404);
  }

  return comic;
};

export const getChaptersBySlug = async (slug) => {
  const comic = await Comic.findOne({ slug });
  if (!comic) {
    throw new AppError('Truyện không tồn tại', 404);
  }

  return Chapter.find({ comicId: comic._id })
    .select('chapterNumber title slug isVIPOnly createdAt')
    .sort({ chapterNumber: 1 })
    .lean();
};

export const getChaptersByComicId = async (comicId) => {
  const comic = await Comic.findById(comicId);
  if (!comic) {
    throw new AppError('Truyện không tồn tại', 404);
  }

  return Chapter.find({ comicId: comic._id })
    .select('chapterNumber title slug isVIPOnly createdAt')
    .sort({ chapterNumber: 1 })
    .lean();
};

export const getComicById = async (comicId) => {
  const comic = await Comic.findById(comicId)
    .populate('categories', 'name slug icon')
    .populate('createdBy', 'username displayName');

  if (!comic) {
    throw new AppError('Truyện không tồn tại', 404);
  }

  const chapters = await Chapter.find({ comicId: comic._id, isPublished: true })
    .select('chapterNumber title slug totalPages views createdAt')
    .sort({ chapterNumber: 1 })
    .lean();

  return { comic, chapters };
};

export const createComic = async (data, file, userId) => {
  const { title, description, author, artist, categories, tags, status, publicationYear } = data;

  if (!title || !description || !author) {
    throw new AppError('Vui lòng cung cấp tiêu đề, mô tả và tác giả', 400);
  }

  if (!file) {
    throw new AppError('Ảnh bìa truyện là bắt buộc', 400);
  }

  const coverImageResult = await uploadToCloudinary(file.buffer, 'metruyen/covers');

  let parsedCategories = [];
  if (categories) {
    try {
      parsedCategories = typeof categories === 'string' ? JSON.parse(categories) : categories;
    } catch {
      parsedCategories = [];
    }
  }

  let parsedTags = [];
  if (tags) {
    try {
      parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
    } catch {
      parsedTags = [];
    }
  }

  const comic = await Comic.create({
    title,
    description,
    author,
    artist: artist || author,
    coverImage: {
      url: coverImageResult.url,
      publicId: coverImageResult.publicId
    },
    categories: parsedCategories,
    tags: parsedTags,
    status: status || 'ongoing',
    publicationYear,
    isPublished: true,
    createdBy: userId
  });

  if (parsedCategories.length > 0) {
    await Category.updateMany(
      { _id: { $in: parsedCategories } },
      { $inc: { comicCount: 1 } }
    );
  }

  return comic;
};

export const updateComic = async (comicId, data, file) => {
  const comic = await Comic.findById(comicId);
  if (!comic) {
    throw new AppError('Truyện không tồn tại', 404);
  }

  const updateData = { ...data };

  if (updateData.categories && typeof updateData.categories === 'string') {
    try { updateData.categories = JSON.parse(updateData.categories); } catch {}
  }

  if (updateData.tags && typeof updateData.tags === 'string') {
    try { updateData.tags = JSON.parse(updateData.tags); } catch {}
  }

  if (file) {
    if (comic.coverImage?.publicId) {
      await deleteFromCloudinary(comic.coverImage.publicId).catch(() => {});
    }

    const coverImageResult = await uploadToCloudinary(file.buffer, 'metruyen/covers');
    updateData.coverImage = {
      url: coverImageResult.url,
      publicId: coverImageResult.publicId
    };
  }

  const updatedComic = await Comic.findByIdAndUpdate(comicId, updateData, {
    returnDocument: 'after',
    runValidators: true
  });

  return updatedComic;
};

export const deleteComic = async (comicId) => {
  const comic = await Comic.findById(comicId);
  if (!comic) {
    throw new AppError('Truyện không tồn tại', 404);
  }

  if (comic.coverImage?.publicId) {
    await deleteFromCloudinary(comic.coverImage.publicId).catch(() => {});
  }

  await Chapter.deleteMany({ comicId: comic._id });
  await comic.deleteOne();

  if (comic.categories?.length > 0) {
    await Category.updateMany(
      { _id: { $in: comic.categories } },
      { $inc: { comicCount: -1 } }
    );
  }

  return true;
};

export const incrementViewCount = async (comicId) => {
  const comic = await Comic.findByIdAndUpdate(
    comicId,
    { $inc: { 'statistics.totalViews': 1 } },
    { returnDocument: 'after' }
  );

  if (!comic) {
    throw new AppError('Truyện không tồn tại', 404);
  }

  return comic.statistics.totalViews;
};

export default {
  getComicsList,
  getComicBySlug,
  getChaptersBySlug,
  getChaptersByComicId,
  getComicById,
  createComic,
  updateComic,
  deleteComic,
  incrementViewCount
};
