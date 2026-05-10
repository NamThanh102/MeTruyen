import * as comicService from '../services/comicService.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getAllComics = asyncHandler(async (req, res) => {
  const { comics, pagination } = await comicService.getComicsList(req.query);
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Comics retrieved successfully',
    data: comics,
    pagination
  });
});

export const getComicBySlug = asyncHandler(async (req, res) => {
  const data = await comicService.getComicBySlug(req.params.slug);
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Comic retrieved successfully',
    data
  });
});

export const getChaptersBySlug = asyncHandler(async (req, res) => {
  const data = await comicService.getChaptersBySlug(req.params.slug);
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Chapters retrieved successfully',
    data
  });
});

export const getChaptersByComicId = asyncHandler(async (req, res) => {
  const data = await comicService.getChaptersByComicId(req.params.id);
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Chapters retrieved successfully',
    data
  });
});

export const getComicById = asyncHandler(async (req, res) => {
  const data = await comicService.getComicById(req.params.id);
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Comic retrieved successfully',
    data
  });
});

export const createComic = asyncHandler(async (req, res) => {
  const comic = await comicService.createComic(req.body, req.file, req.user._id);
  res.status(201).json({
    success: true,
    statusCode: 201,
    message: 'Comic created successfully',
    data: { comic }
  });
});

export const updateComic = asyncHandler(async (req, res) => {
  const comic = await comicService.updateComic(req.params.id, req.body, req.file);
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Comic updated successfully',
    data: { comic }
  });
});

export const deleteComic = asyncHandler(async (req, res) => {
  await comicService.deleteComic(req.params.id);
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Comic deleted successfully'
  });
});

export const increaseView = asyncHandler(async (req, res) => {
  const totalViews = await comicService.incrementViewCount(req.params.id);
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'View count updated',
    data: { totalViews }
  });
});

export default {
  getAllComics,
  getComicBySlug,
  getChaptersBySlug,
  getChaptersByComicId,
  getComicById,
  createComic,
  updateComic,
  deleteComic,
  increaseView
};
