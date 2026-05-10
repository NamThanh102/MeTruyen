import multer from 'multer';
import { AppError } from './errorHandler.js';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files (JPEG, PNG, WebP, GIF) are allowed!', 400), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

export const uploadSingle = (fieldName) => upload.single(fieldName);
export const uploadMultiple = (fieldName, maxCount = 50) => upload.array(fieldName, maxCount);
export const uploadFields = (fields) => upload.fields(fields);

export default {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields
};
