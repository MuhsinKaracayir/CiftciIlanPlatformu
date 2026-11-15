export function createLoggerMiddleware() {
  return (req, res, next) => {
    const startTime = process.hrtime.bigint();

    res.on('finish', () => {
      const endTime = process.hrtime.bigint();
      const durationInMs = (Number(endTime - startTime) / 1_000_000).toFixed(2);

      const timestamp = new Date().toISOString();
      const method = req.method;
      const url = req.originalUrl || req.url;
      const statusCode = res.statusCode;
      const ip = req.ip || req.socket?.remoteAddress || '-';

      console.log(`[HTTP] ${timestamp} | ${method} ${url} ${statusCode} (${durationInMs} ms) - IP: ${ip}`);
    });

    next();
  };
}
