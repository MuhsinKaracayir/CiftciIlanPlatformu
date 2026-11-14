import multer from 'multer';
import { AppError } from '../utils/AppError.js';

export function notFoundHandler(req, res, next) {
  next(AppError.notFound(`Uç nokta bulunamadı: ${req.method} ${req.originalUrl}`));
}

export function createErrorHandler({ nodeEnv = 'development' } = {}) {
  return (err, req, res, next) => {
    let normalizedError = err;

    // Multer dosya yükleme hataları
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        normalizedError = AppError.badRequest('Yüklenen resim dosyası maksimum boyutu (5MB) aşıyor.');
      } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        normalizedError = AppError.badRequest('Resim dosyası "image" alan adıyla gönderilmelidir.');
      } else {
        normalizedError = AppError.badRequest(`Dosya yükleme hatası: ${err.message}`);
      }
    }

    // Bozuk JSON gövdesi hatası
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      normalizedError = AppError.badRequest('Geçersiz JSON formatı.');
    }

    // MS SQL bağlantı hataları
    if (err?.code === 'ESOCKET' || err?.code === 'ELOGIN' || err?.code === 'ETIMEOUT') {
      normalizedError = new AppError('Veritabanı servisine şu anda ulaşılamıyor.', 503);
    }

    const statusCode = normalizedError.statusCode || 500;
    const isOperational = Boolean(normalizedError.isOperational);

    if (!isOperational) {
      console.error('[Beklenmeyen Sunucu Hatası]:', err);
    }

    const responseBody = {
      success: false,
      status: normalizedError.status || 'error',
      message: isOperational || nodeEnv === 'development'
        ? normalizedError.message
        : 'Sunucu tarafında beklenmeyen bir hata oluştu.',
    };

    if (normalizedError.details) {
      responseBody.errors = normalizedError.details;
    }

    if (nodeEnv === 'development' && err?.stack) {
      responseBody.stack = err.stack;
    }

    res.status(statusCode).json(responseBody);
  };
}

