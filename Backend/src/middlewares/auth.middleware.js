import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';

export function createAuthMiddleware({ jwtSecret, userRepository }) {
  if (!jwtSecret) {
    throw new Error('createAuthMiddleware için jwtSecret zorunludur.');
  }

  const authenticate = async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw AppError.unauthorized('Giriş yapmanız gerekmektedir (Yetkilendirme başlığı eksik veya biçimi geçersiz).');
      }

      const token = authHeader.slice(7).trim();

      if (!token) {
        throw AppError.unauthorized('Geçerli bir erişim belirteci (token) sağlanmadı.');
      }

      let decoded;
      try {
        decoded = jwt.verify(token, jwtSecret);
      } catch (err) {
        if (err.name === 'TokenExpiredError') {
          throw AppError.unauthorized('Oturum süreniz doldu, lütfen tekrar giriş yapın.');
        }
        throw AppError.unauthorized('Geçersiz erişim belirteci (token).');
      }

      if (userRepository) {
        const user = await userRepository.findById(decoded.id);
        if (!user) {
          throw AppError.unauthorized('Bu belirtece ait kullanıcı hesabı artık mevcut değil.');
        }
        req.user = {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
        };
      } else {
        req.user = decoded;
      }

      return next();
    } catch (err) {
      return next(err);
    }
  };

  const authorize = (...roles) => {
    return (req, res, next) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return next(AppError.forbidden('Bu işlemi gerçekleştirmek için yetkiniz bulunmamaktadır.'));
      }
      return next();
    };
  };

  return {
    authenticate,
    authorize,
  };
}

