import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { upload as defaultUpload } from '../middlewares/upload.middleware.js';
import {
  validateIdParam,
  validateCreateListing,
  validateUpdateListing,
  validateChangeStatus,
} from '../middlewares/validation.middleware.js';

export function createListingRoutes(listingController, upload = defaultUpload, authMiddleware = null) {
  if (!listingController) {
    throw new Error('createListingRoutes icin listingController bagimliligi zorunludur.');
  }

  const router = Router();
  const requireAuth = authMiddleware?.authenticate ? authMiddleware.authenticate : (req, res, next) => next();

  router.get('/', asyncHandler(listingController.getAll));
  router.get('/:id', validateIdParam, asyncHandler(listingController.getById));

  router.post(
    '/',
    requireAuth,
    upload.single('image'),
    asyncHandler(validateCreateListing),
    asyncHandler(listingController.create)
  );

  router.put(
    '/:id',
    requireAuth,
    validateIdParam,
    upload.single('image'),
    asyncHandler(validateUpdateListing),
    asyncHandler(listingController.update)
  );

  router.patch(
    '/:id/status',
    requireAuth,
    validateIdParam,
    validateChangeStatus,
    asyncHandler(listingController.changeStatus)
  );

  router.delete(
    '/:id',
    requireAuth,
    validateIdParam,
    asyncHandler(listingController.remove)
  );

  return router;
}

