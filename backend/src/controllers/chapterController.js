import * as chapterService from '../services/chapterService.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getChapterById = asyncHandler(async (req, res) => {
  const chapter = await chapterService.getChapterById(req.params.id, req.user);
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Chapter retrieved successfully',
    data: { chapter }
  });
});

export const createChapter = asyncHandler(async (req, res) => {
  const chapterData = {
    ...req.body,
    comicId: req.params.comicId || req.body.comicId
  };
  const chapter = await chapterService.createChapter(chapterData, req.files);
  res.status(201).json({
    success: true,
    statusCode: 201,
    message: 'Chapter created successfully',
    data: { chapter }
  });
});

export const updateChapter = asyncHandler(async (req, res) => {
  const chapter = await chapterService.updateChapter(req.params.id, req.body, req.files);
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Chapter updated successfully',
    data: { chapter }
  });
});

export const deleteChapter = asyncHandler(async (req, res) => {
  await chapterService.deleteChapter(req.params.id);
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Chapter deleted successfully'
  });
});

export default {
  getChapterById,
  createChapter,
  updateChapter,
  deleteChapter
};
