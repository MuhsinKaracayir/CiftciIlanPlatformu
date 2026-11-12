import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';

export function createAuthMiddleware({ jwtSecret, userRepository }) {
  if (!jwtSecret) {
    throw new Error('createAuthMiddleware icin jwtSecret zorunludur.');
  }

  const authenticate = async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw AppError.unauthorized('Giris yapmaniz gerekmektedir (Yetkilendirme basligi eksik veya bicimi gecersiz).');
      }

      const token = authHeader.slice(7).trim();

      if (!token) {
        throw AppError.unauthorized('Gecerli bir erisim belirteci (token) saglanmadi.');
      }

      let decoded;
      try {
        decoded = jwt.verify(token, jwtSecret);
      } catch (err) {
        if (err.name === 'TokenExpiredError') {
          throw AppError.unauthorized('Oturum sureniz doldu, lutfen tekrar giris yapin.');
        }
        throw AppError.unauthorized('Gecersiz erisim belirteci (token).');
      }

      if (userRepository) {
        const user = await userRepository.findById(decoded.id);
        if (!user) {
          throw AppError.unauthorized('Bu belirtece ait kullanici hesabi artik mevcut degil.');
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
        return next(AppError.forbidden('Bu islemi gerceklestirmek icin yetkiniz bulunmamaktadir.'));
      }
      return next();
    };
  };

  return {
    authenticate,
    authorize,
  };
}

