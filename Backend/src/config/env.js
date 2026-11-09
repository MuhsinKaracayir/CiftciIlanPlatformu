import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config();

const requiredVariables = [
  'DB_USER',
  'DB_PASSWORD',
  'DB_SERVER',
  'DB_NAME',
];

for (const variableName of requiredVariables) {
  if (!process.env[variableName]) {
    throw new Error(`Zorunlu ortam degiskeni eksik: ${variableName}`);
  }
}

const uploadFolderName = process.env.UPLOAD_DIR || 'uploads';

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,
  corsOrigin: process.env.CORS_ORIGIN || '*',
  db: Object.freeze({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    port: Number(process.env.DB_PORT) || 1433,
    database: process.env.DB_NAME,
    pool: Object.freeze({
      max: Number(process.env.DB_POOL_MAX) || 10,
      min: Number(process.env.DB_POOL_MIN) || 2,
      idleTimeoutMillis: Number(process.env.DB_POOL_IDLE_TIMEOUT_MS) || 30000,
    }),
    options: Object.freeze({
      encrypt: process.env.DB_ENCRYPT === 'true',
      trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false',
      enableArithAbort: true,
    }),
  }),
  upload: Object.freeze({
    folderName: uploadFolderName,
    dir: path.resolve(process.cwd(), uploadFolderName),
    maxFileSizeBytes: Number(process.env.MAX_FILE_SIZE_BYTES) || 5 * 1024 * 1024,
  }),
  jwt: Object.freeze({
    secret: process.env.JWT_SECRET || 'ciftci_ilan_platformu_super_secret_jwt_key_2026',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  }),
});

