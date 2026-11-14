import { AppError } from '../utils/AppError.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegister(req, res, next) {
  const { fullName, email, password, phone } = req.body || {};
  const errors = [];

  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
    errors.push('Ad soyad en az 2 karakter olmalıdır.');
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.push('Geçerli bir e-posta adresi girilmelidir.');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Şifre en az 6 karakter uzunluğunda olmalıdır.');
  }

  if (phone !== undefined && phone !== null && phone !== '') {
    if (typeof phone !== 'string' || phone.trim().length < 7 || phone.trim().length > 30) {
      errors.push('Telefon numarası 7 ile 30 karakter arasında olmalıdır.');
    }
  }

  if (errors.length > 0) {
    return next(AppError.badRequest(errors.join(' ')));
  }

  return next();
}

export function validateLogin(req, res, next) {
  const { email, password } = req.body || {};
  const errors = [];

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.push('Geçerli bir e-posta adresi gereklidir.');
  }

  if (!password || typeof password !== 'string' || password.trim() === '') {
    errors.push('Şifre gereklidir.');
  }

  if (errors.length > 0) {
    return next(AppError.badRequest(errors.join(' ')));
  }

  return next();
}

