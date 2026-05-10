import Chapter from '../models/Chapter.js';
import Comic from '../models/Comic.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import { AppError } from '../middlewares/errorHandler.js';

export const updateChapterNavigation = async (comicId) => {
  const chapters = await Chapter.find({ comicId }).sort({ chapterNumber: 1 }).lean();
  if (chapters.length === 0) return;

  const bulkOps = chapters.map((ch, i) => ({
    updateOne: {
      filter: { _id: ch._id },
      update: {
        $set: {
          previousChapter: i > 0 ? chapters[i - 1]._id : null,
          nextChapter: i < chapters.length - 1 ? chapters[i + 1]._id : null
        }
      }
    }
  }));

  await Chapter.bulkWrite(bulkOps);
};

export const getChapterById = async (chapterId, currentUser) => {
  const chapter = await Chapter.findById(chapterId)
    .populate('comicId', 'title slug author')
    .populate('previousChapter', 'chapterNumber title slug')
    .populate('nextChapter', 'chapterNumber title slug');

  if (!chapter) {
    throw new AppError('Chapter không tồn tại', 404);
  }

  if (chapter.isVIPOnly) {
    if (!currentUser) {
      throw new AppError('Chapter này yêu cầu đăng nhập tài khoản VIP', 401);
    }
    const now = new Date();
    const isVipActive = currentUser.isVIP && (!currentUser.vipExpireDate || now < new Date(currentUser.vipExpireDate));
    if (!isVipActive) {
      throw new AppError('Chapter này yêu cầu tài khoản VIP', 403);
    }
  }

  // Atomic view increment to avoid saving heavy page arrays
  await Chapter.findByIdAndUpdate(chapter._id, { $inc: { views: 1 } });
  chapter.views += 1;

  return chapter;
};

export const createChapter = async (data, files) => {
  const comicId = data.comicId;
  const { chapterNumber, title, isPublished, isVIPOnly } = data;

  if (!comicId || !chapterNumber) {
    throw new AppError('Vui lòng cung cấp comic ID và số chapter', 400);
  }

  const comic = await Comic.findById(comicId);
  if (!comic) {
    throw new AppError('Truyện không tồn tại', 404);
  }

  const existingChapter = await Chapter.findOne({ comicId, chapterNumber });
  if (existingChapter) {
    throw new AppError('Số chapter này đã tồn tại trong truyện', 400);
  }

  if (!files || files.length === 0) {
    throw new AppError('Vui lòng tải lên ít nhất 1 trang ảnh', 400);
  }

  const uploadPromises = files.map((file, index) =>
    uploadToCloudinary(
      file.buffer,
      `metruyen/comics/${comic.slug}/chapter-${chapterNumber}`
    ).then((result) => ({
      url: result.url,
      publicId: result.publicId,
      width: result.width,
      height: result.height,
      order: index + 1
    }))
  );

  const pages = await Promise.all(uploadPromises);

  const chapter = await Chapter.create({
    comicId,
    chapterNumber,
    title,
    pages,
    isPublished: isPublished !== undefined ? (isPublished === 'true' || isPublished === true) : true,
    publishDate: isPublished !== 'false' && isPublished !== false ? Date.now() : null,
    isVIPOnly: isVIPOnly !== undefined ? (isVIPOnly === 'true' || isVIPOnly === true) : false
  });

  await updateChapterNavigation(comicId);
  await comic.updateChapterCount();

  return chapter;
};

export const updateChapter = async (chapterId, data, files) => {
  const { title, isPublished, isVIPOnly, keptPages } = data;

  const chapter = await Chapter.findById(chapterId);
  if (!chapter) {
    throw new AppError('Chapter không tồn tại', 404);
  }

  if (title !== undefined) chapter.title = title;
  if (isPublished !== undefined) {
    chapter.isPublished = isPublished === 'true' || isPublished === true;
    chapter.publishDate = chapter.isPublished ? (chapter.publishDate || Date.now()) : null;
  }
  if (isVIPOnly !== undefined) {
    chapter.isVIPOnly = isVIPOnly === 'true' || isVIPOnly === true;
  }

  if (keptPages !== undefined) {
    let keptList = [];
    try { keptList = JSON.parse(keptPages); } catch {}

    const keptIds = keptList.map(k => k._id);
    const toRemove = chapter.pages.filter(p => !keptIds.includes(p._id.toString()));

    const deletePromises = toRemove
      .filter(p => p.publicId)
      .map(p => deleteFromCloudinary(p.publicId));
    await Promise.allSettled(deletePromises);

    const keptMap = {};
    chapter.pages.forEach(p => { keptMap[p._id.toString()] = p; });
    chapter.pages = keptList
      .filter(k => keptMap[k._id])
      .map((k, i) => {
        const p = keptMap[k._id];
        p.order = i + 1;
        return p;
      });
  }

  if (files && files.length > 0) {
    const comic = await Comic.findById(chapter.comicId).select('slug');
    const startOrder = chapter.pages.length + 1;
    const uploadPromises = files.map((file, index) =>
      uploadToCloudinary(
        file.buffer,
        `metruyen/comics/${comic.slug}/chapter-${chapter.chapterNumber}`
      ).then(result => ({
        url: result.url,
        publicId: result.publicId,
        width: result.width,
        height: result.height,
        order: startOrder + index
      }))
    );
    const newPages = await Promise.all(uploadPromises);
    chapter.pages.push(...newPages);
  }

  await chapter.save();
  return chapter;
};

export const deleteChapter = async (chapterId) => {
  const chapter = await Chapter.findById(chapterId);
  if (!chapter) {
    throw new AppError('Chapter không tồn tại', 404);
  }

  // Delete pages from Cloudinary in parallel
  const deletePromises = (chapter.pages || [])
    .filter(p => p.publicId)
    .map(p => deleteFromCloudinary(p.publicId));
  await Promise.allSettled(deletePromises);

  const comicId = chapter.comicId;
  await Chapter.deleteOne({ _id: chapterId });

  await updateChapterNavigation(comicId);
  const comic = await Comic.findById(comicId);
  if (comic) {
    await comic.updateChapterCount();
    await Comic.findByIdAndUpdate(comicId, { lastChapterUpdate: new Date() });
  }

  return true;
};

export default {
  getChapterById,
  createChapter,
  updateChapter,
  deleteChapter,
  updateChapterNavigation
};
