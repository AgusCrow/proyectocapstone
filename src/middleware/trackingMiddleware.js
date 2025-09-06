import { ApiStat } from '../database/database.js';

// Middleware de tracking: registra por request los datos de uso
const trackingMiddleware = (req, res, next) => {
  const startHr = process.hrtime.bigint();
  const endpointAccess = req.baseUrl ? `${req.baseUrl}${req.route ? req.route.path : ''}` : req.originalUrl;
  const requestMethod = req.method;
  const userId = req.user?.id ? String(req.user.id) : null;

  res.on('finish', async () => {
    try {
      const endHr = process.hrtime.bigint();
      const diffNs = Number(endHr - startHr);
      const responseTimeMs = Math.max(0, Math.round(diffNs / 1e6));
      const statusCode = res.statusCode;

      await ApiStat.create({
        endpointAccess,
        requestMethod,
        statusCode,
        responseTimeMs,
        userId,
        timestamp: new Date()
      });
    } catch (err) {
      // Evitar romper el request por errores de tracking
      if (process.env.TRACKING_DEBUG === 'true') {
        // eslint-disable-next-line no-console
        console.error('Tracking error:', err);
      }
    }
  });

  next();
};

export default trackingMiddleware;


