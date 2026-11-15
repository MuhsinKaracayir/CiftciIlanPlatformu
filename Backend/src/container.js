import { env } from './config/env.js';
import { createDatabasePool } from './config/database.js';
import { createUploadMiddleware } from './middlewares/upload.middleware.js';
import { createAuthMiddleware } from './middlewares/auth.middleware.js';
import { createLoggerMiddleware } from './middlewares/logger.middleware.js';
import { ListingRepository } from './repositories/listing.repository.js';
import { UserRepository } from './repositories/user.repository.js';
import { CategoryRepository } from './repositories/category.repository.js';
import { ListingService } from './services/listing.service.js';
import { AuthService } from './services/auth.service.js';
import { CategoryService } from './services/category.service.js';
import { ListingController } from './controllers/listing.controller.js';
import { AuthController } from './controllers/auth.controller.js';
import { CategoryController } from './controllers/category.controller.js';

export function createContainer() {
  // 1. Veritabani Baglanti Havuzu
  const dbPool = createDatabasePool(env.db);

  // 2. Middleware Yapilandirmalari
  const uploadMiddleware = createUploadMiddleware({
    uploadsDir: env.upload.dir,
    maxFileSizeBytes: env.upload.maxFileSizeBytes,
  });

  // 3. Repository Katmani (dbPool Constructor Injection)
  const listingRepository = new ListingRepository(dbPool);
  const userRepository = new UserRepository(dbPool);
  const categoryRepository = new CategoryRepository(dbPool);

  // 4. Service Katmani
  const listingService = new ListingService(
    listingRepository,
    categoryRepository,
    env.upload.dir
  );
  const authService = new AuthService(userRepository, env.jwt);
  const categoryService = new CategoryService(categoryRepository);

  // 5. Controller Katmani
  const listingController = new ListingController(listingService);
  const authController = new AuthController(authService);
  const categoryController = new CategoryController(categoryService);

  // 6. Yetkilendirme ve Loglama Middleware'leri
  const authMiddleware = createAuthMiddleware({
    jwtSecret: env.jwt.secret,
    userRepository,
  });
  const loggerMiddleware = createLoggerMiddleware();

  return Object.freeze({
    env,
    dbPool,
    repositories: Object.freeze({
      listingRepository,
      userRepository,
      categoryRepository,
    }),
    services: Object.freeze({
      listingService,
      authService,
      categoryService,
    }),
    controllers: Object.freeze({
      listingController,
      authController,
      categoryController,
    }),
    middlewares: Object.freeze({
      uploadMiddleware,
      authMiddleware,
      loggerMiddleware,
    }),
  });
}
