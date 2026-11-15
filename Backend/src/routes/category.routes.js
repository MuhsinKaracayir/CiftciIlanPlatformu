import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validateIdParam } from '../middlewares/validation.middleware.js';

export function createCategoryRoutes(categoryController, authMiddleware = null) {
  if (!categoryController) {
    throw new Error('createCategoryRoutes icin categoryController bagimliligi zorunludur.');
  }

  const router = Router();
  const requireAuth = authMiddleware?.authenticate ? authMiddleware.authenticate : (req, res, next) => next();
  const requireAdmin = authMiddleware?.authorize ? authMiddleware.authorize('admin') : (req, res, next) => next();

  router.get('/', asyncHandler(categoryController.getAll));
  router.get('/:id', validateIdParam, asyncHandler(categoryController.getById));

  router.post(
    '/',
    requireAuth,
    requireAdmin,
    asyncHandler(categoryController.create)
  );

  router.put(
    '/:id',
    requireAuth,
    requireAdmin,
    validateIdParam,
    asyncHandler(categoryController.update)
  );

  router.delete(
    '/:id',
    requireAuth,
    requireAdmin,
    validateIdParam,
    asyncHandler(categoryController.remove)
  );

  return router;
}
