import sql from 'mssql';

export function createDatabasePool(dbConfig) {
  if (!dbConfig) {
    throw new Error('Veritabanı yapılandırması (dbConfig) zorunludur.');
  }

  const pool = new sql.ConnectionPool({
    user: dbConfig.user,
    password: dbConfig.password,
    server: dbConfig.server,
    port: dbConfig.port,
    database: dbConfig.database,
    pool: {
      max: dbConfig.pool.max,
      min: dbConfig.pool.min,
      idleTimeoutMillis: dbConfig.pool.idleTimeoutMillis,
    },
    options: {
      encrypt: dbConfig.options.encrypt,
      trustServerCertificate: dbConfig.options.trustServerCertificate,
      enableArithAbort: dbConfig.options.enableArithAbort,
    },
  });

  pool.on('error', (err) => {
    console.error('[MSSQL ConnectionPool Hatasi]:', err.message);
  });

  return pool;
}

