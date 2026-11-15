import { Router } from 'express';
import { createListingRoutes } from './listing.routes.js';
import { createAuthRoutes } from './auth.routes.js';
import { createCategoryRoutes } from './category.routes.js';

export function createApiRoutes({ controllers, middlewares, dbPool }) {
  const router = Router();

  router.get('/health', (req, res) => {
    res.status(200).json({
      success: true,
      status: 'UP',
      databaseConnected: Boolean(dbPool?.connected),
      timestamp: new Date().toISOString(),
    });
  });

  router.use(
    '/auth',
    createAuthRoutes(controllers.authController, middlewares.authMiddleware)
  );

  router.use(
    '/categories',
    createCategoryRoutes(controllers.categoryController, middlewares.authMiddleware)
  );

  router.use(
    '/listings',
    createListingRoutes(
      controllers.listingController,
      middlewares.uploadMiddleware,
      middlewares.authMiddleware
    )
  );

  return router;
}
