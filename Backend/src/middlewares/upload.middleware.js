import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import multer from 'multer';
import { AppError } from '../utils/AppError.js';

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export function createUploadMiddleware({
  uploadsDir = path.resolve(process.cwd(), 'uploads'),
  maxFileSizeBytes = 5 * 1024 * 1024,
} = {}) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      fs.mkdir(uploadsDir, { recursive: true })
        .then(() => cb(null, uploadsDir))
        .catch((err) => cb(err));
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const uniqueName = `listing-${Date.now()}-${crypto.randomUUID()}${ext}`;
      cb(null, uniqueName);
    },
  });

  const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const isMimeValid = ALLOWED_MIME_TYPES.has(file.mimetype);
    const isExtValid = ALLOWED_EXTENSIONS.has(ext);

    if (!isMimeValid || !isExtValid) {
      return cb(
        AppError.badRequest(
          'Sadece .jpg, .jpeg, .png ve .webp formatindaki resim dosyalari yuklenebilir.'
        ),
        false
      );
    }

    return cb(null, true);
  };

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxFileSizeBytes,
      files: 1,
    },
  });
}

export const upload = createUploadMiddleware();

