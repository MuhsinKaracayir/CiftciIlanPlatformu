import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { createApiRoutes } from './routes/index.js';
import { notFoundHandler, createErrorHandler } from './middlewares/error.middleware.js';

export function createApp(container) {
  if (!container) {
    throw new Error('createApp icin DI container bagimliligi zorunludur.');
  }

  const app = express();

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false,
    })
  );

  app.use(
    cors({
      origin: container.env.corsOrigin,
    })
  );

  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));

  // Yuklenen ilan resimlerini disaridan erisime ac
  app.use('/uploads', express.static(container.env.upload.dir));

  // Karsilama ve Bilgilendirme Rotasi
  app.get('/', (req, res) => {
    return res.status(200).json({
      success: true,
      message: 'Ciftci Ilan Platformu API servisine hos geldiniz.',
      endpoints: {
        health: '/api/v1/health',
        listings: '/api/v1/listings',
      },
    });
  });

  // REST API rotalari
  app.use('/api/v1', createApiRoutes(container));

  // Merkezi hata yonetimi
  app.use(notFoundHandler);
  app.use(createErrorHandler({ nodeEnv: container.env.nodeEnv }));

  return app;
}

