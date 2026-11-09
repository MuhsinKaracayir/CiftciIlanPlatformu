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

  // Karsilama ve Dokumantasyon / Yonlendirme Rotasi
  app.get('/', (req, res) => {
    if (req.accepts('html')) {
      return res.type('html').send(`
        <!DOCTYPE html>
        <html lang="tr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Ciftci Ilan Platformu API</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #0f172a; color: #f8fafc; padding: 2.5rem 1rem; }
            .container { max-width: 680px; margin: 0 auto; }
            h1 { font-size: 1.8rem; color: #38bdf8; margin-bottom: 0.5rem; }
            p.subtitle { color: #94a3b8; margin-bottom: 2rem; font-size: 1rem; line-height: 1.5; }
            .card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; }
            .card h2 { font-size: 1.1rem; color: #e2e8f0; margin-bottom: 1rem; border-bottom: 1px solid #334155; padding-bottom: 0.5rem; }
            ul { list-style: none; }
            li { padding: 0.85rem 0; border-bottom: 1px solid #334155; display: flex; flex-direction: column; gap: 0.35rem; }
            li:last-child { border-bottom: none; }
            .endpoint { display: flex; align-items: center; gap: 0.75rem; }
            .badge { display: inline-block; padding: 0.2rem 0.5rem; font-size: 0.75rem; font-weight: 700; border-radius: 6px; }
            .badge-get { background: #0284c7; color: #ffffff; }
            .badge-post { background: #16a34a; color: #ffffff; }
            .badge-put { background: #d97706; color: #ffffff; }
            .badge-patch { background: #8b5cf6; color: #ffffff; }
            .badge-delete { background: #dc2626; color: #ffffff; }
            a.link { color: #38bdf8; text-decoration: none; font-family: Consolas, monospace; font-size: 1rem; font-weight: 600; }
            a.link:hover { text-decoration: underline; color: #7dd3fc; }
            .desc { color: #94a3b8; font-size: 0.875rem; line-height: 1.4; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Ciftci Ilan Platformu API</h1>
            <p class="subtitle">API servisi ve veritabani baglantisi basariyla calisiyor. Asagidaki baglantilari kullanarak servisi test edebilirsiniz:</p>
            
            <div class="card">
              <h2>Temel Uç Noktalar</h2>
              <ul>
                <li>
                  <div class="endpoint">
                    <span class="badge badge-get">GET</span>
                    <a class="link" href="/api/v1/health">/api/v1/health</a>
                  </div>
                  <div class="desc">Sistem saglik ve veritabani baglanti durumunu kontrol eder.</div>
                </li>
                <li>
                  <div class="endpoint">
                    <span class="badge badge-get">GET</span>
                    <a class="link" href="/api/v1/listings">/api/v1/listings</a>
                  </div>
                  <div class="desc">Tum ilanlari listeler. Filtreleme parametreleri: ?category=... &location=... &search=...</div>
                </li>
              </ul>
            </div>

            <div class="card">
              <h2>Kimlik Dogrulama ve Kullanici Islemleri (JWT Auth)</h2>
              <ul>
                <li>
                  <div class="endpoint">
                    <span class="badge badge-post">POST</span>
                    <span style="font-family: Consolas, monospace; color: #cbd5e1;">/api/v1/auth/register</span>
                  </div>
                  <div class="desc">Yeni kullanici kaydi (fullName, email, password, phone). Basarili kayitta token doner.</div>
                </li>
                <li>
                  <div class="endpoint">
                    <span class="badge badge-post">POST</span>
                    <span style="font-family: Consolas, monospace; color: #cbd5e1;">/api/v1/auth/login</span>
                  </div>
                  <div class="desc">Kullanici girisi (email, password). Dogrulama sonrasi JWT erisim belirteci (token) doner.</div>
                </li>
                <li>
                  <div class="endpoint">
                    <span class="badge badge-get">GET</span>
                    <span style="font-family: Consolas, monospace; color: #cbd5e1;">/api/v1/auth/me</span>
                  </div>
                  <div class="desc">Giris yapmis kullanicinin profilini getirir (Header: Authorization: Bearer &lt;token&gt; zorunludur).</div>
                </li>
              </ul>
            </div>

            <div class="card">
              <h2>Diger API Islemleri (Postman / Frontend)</h2>
              <ul>
                <li>
                  <div class="endpoint">
                    <span class="badge badge-get">GET</span>
                    <span style="font-family: Consolas, monospace; color: #cbd5e1;">/api/v1/listings/:id</span>
                  </div>
                  <div class="desc">Belirli bir ilanin detayini getirir.</div>
                </li>
                <li>
                  <div class="endpoint">
                    <span class="badge badge-post">POST</span>
                    <span style="font-family: Consolas, monospace; color: #cbd5e1;">/api/v1/listings</span>
                  </div>
                  <div class="desc">Yeni ilan olusturur (Giris yapmis kullaniciya otomatik baglanir, Bearer token zorunludur).</div>
                </li>
                <li>
                  <div class="endpoint">
                    <span class="badge badge-put">PUT</span>
                    <span style="font-family: Consolas, monospace; color: #cbd5e1;">/api/v1/listings/:id</span>
                  </div>
                  <div class="desc">Mevcut ilani gunceller (Yalnizca ilan sahibi veya yonetici guncelleyebilir).</div>
                </li>
                <li>
                  <div class="endpoint">
                    <span class="badge badge-patch">PATCH</span>
                    <span style="font-family: Consolas, monospace; color: #cbd5e1;">/api/v1/listings/:id/status</span>
                  </div>
                  <div class="desc">Ilan durumunu degistirir (active, sold, passive). Yalnizca ilan sahibi veya yonetici degistirebilir.</div>
                </li>
                <li>
                  <div class="endpoint">
                    <span class="badge badge-delete">DELETE</span>
                    <span style="font-family: Consolas, monospace; color: #cbd5e1;">/api/v1/listings/:id</span>
                  </div>
                  <div class="desc">Ilani ve gorselini siler (Yalnizca ilan sahibi veya yonetici silebilir).</div>
                </li>
              </ul>
            </div>
          </div>
        </body>
        </html>
      `);
    }

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

