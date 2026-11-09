import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validateRegister, validateLogin } from '../middlewares/authValidation.middleware.js';

export function createAuthRoutes(authController, authMiddleware) {
  if (!authController) {
    throw new Error('createAuthRoutes icin authController bagimliligi zorunludur.');
  }

  const router = Router();

  router.post('/register', validateRegister, asyncHandler(authController.register));
  router.post('/login', validateLogin, asyncHandler(authController.login));
  router.get('/me', authMiddleware.authenticate, asyncHandler(authController.getMe));

  return router;
}

