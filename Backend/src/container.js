import { env } from './config/env.js';
import { createDatabasePool } from './config/database.js';
import { createUploadMiddleware } from './middlewares/upload.middleware.js';
import { createAuthMiddleware } from './middlewares/auth.middleware.js';
import { ListingRepository } from './repositories/listing.repository.js';
import { UserRepository } from './repositories/user.repository.js';
import { ListingService } from './services/listing.service.js';
import { AuthService } from './services/auth.service.js';
import { ListingController } from './controllers/listing.controller.js';
import { AuthController } from './controllers/auth.controller.js';

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

  // 4. Service Katmani
  const listingService = new ListingService(listingRepository, env.upload.dir);
  const authService = new AuthService(userRepository, env.jwt);

  // 5. Controller Katmani
  const listingController = new ListingController(listingService);
  const authController = new AuthController(authService);

  // 6. Yetkilendirme Middleware'i
  const authMiddleware = createAuthMiddleware({
    jwtSecret: env.jwt.secret,
    userRepository,
  });

  return Object.freeze({
    env,
    dbPool,
    repositories: Object.freeze({
      listingRepository,
      userRepository,
    }),
    services: Object.freeze({
      listingService,
      authService,
    }),
    controllers: Object.freeze({
      listingController,
      authController,
    }),
    middlewares: Object.freeze({
      uploadMiddleware,
      authMiddleware,
    }),
  });
}

