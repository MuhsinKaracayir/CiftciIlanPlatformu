import fs from 'node:fs/promises';
import { createContainer } from './container.js';
import { createApp } from './app.js';

async function bootstrap() {
  const container = createContainer();

  try {
    await fs.mkdir(container.env.upload.dir, { recursive: true });
    await container.dbPool.connect();
    console.log('[MSSQL]: Veritabani baglanti havuzu basariyla olusturuldu.');
  } catch (err) {
    console.error('[Baslatma Hatasi]: Sunucu baslatilamadi:', err.message);
    process.exit(1);
  }

  const app = createApp(container);

  const server = app.listen(container.env.port, () => {
    console.log(
      `[Server]: Ciftci Ilan Platformu API ${container.env.nodeEnv} modunda http://localhost:${container.env.port} adresinde calisiyor.`
    );
  });

  const gracefulShutdown = async (signal) => {
    console.log(`\n[${signal}]: Sunucu guvenli sekilde kapatiliyor...`);

    server.close(async () => {
      try {
        await container.dbPool.close();
        console.log('[MSSQL]: Veritabani baglanti havuzu kapatildi.');
        process.exit(0);
      } catch (closeErr) {
        console.error('[MSSQL]: Havuz kapatilirken hata olustu:', closeErr.message);
        process.exit(1);
      }
    });
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
}

bootstrap();

