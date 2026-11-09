import multer from 'multer';
import { AppError } from '../utils/AppError.js';

export function notFoundHandler(req, res, next) {
  next(AppError.notFound(`Endpoint bulunamadi: ${req.method} ${req.originalUrl}`));
}

export function createErrorHandler({ nodeEnv = 'development' } = {}) {
  return (err, req, res, next) => {
    let normalizedError = err;

    // Multer dosya yukleme hatalari
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        normalizedError = AppError.badRequest('Yuklenen resim dosyasi maksimum boyutu (5MB) asiyor.');
      } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        normalizedError = AppError.badRequest('Resim dosyasi "image" alan adiyla gonderilmelidir.');
      } else {
        normalizedError = AppError.badRequest(`Dosya yukleme hatasi: ${err.message}`);
      }
    }

    // Bozuk JSON govdesi hatasi
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      normalizedError = AppError.badRequest('Gecersiz JSON formati.');
    }

    // MS SQL baglanti hatalari
    if (err?.code === 'ESOCKET' || err?.code === 'ELOGIN' || err?.code === 'ETIMEOUT') {
      normalizedError = new AppError('Veritabani servisine su anda ulasilamiyor.', 503);
    }

    const statusCode = normalizedError.statusCode || 500;
    const isOperational = Boolean(normalizedError.isOperational);

    if (!isOperational) {
      console.error('[Beklenmeyen Sunucu Hatasi]:', err);
    }

    const responseBody = {
      success: false,
      status: normalizedError.status || 'error',
      message: isOperational || nodeEnv === 'development'
        ? normalizedError.message
        : 'Sunucu tarafinda beklenmeyen bir hata olustu.',
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

