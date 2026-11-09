export class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, details = null) {
    return new AppError(message, 400, details);
  }

  static notFound(message = 'Istenen ilan bulunamadi.') {
    return new AppError(message, 404);
  }

  static unauthorized(message = 'Giris yapmaniz gerekmektedir.') {
    return new AppError(message, 401);
  }

  static forbidden(message = 'Bu islemi gerceklestirmek icin yetkiniz bulunmamaktadir.') {
    return new AppError(message, 403);
  }

  static conflict(message = 'Kayit cakismasi meydana geldi.') {
    return new AppError(message, 409);
  }
}

