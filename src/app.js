import cors from 'cors';
import 'dotenv/config';
import express from 'express';

import cacheMiddleware, { cacheUtils } from './middleware/cacheMiddleware.js';
import trackingMiddleware from './middleware/trackingMiddleware.js';
import cardsRoutes from './routes/cardsRoutes.js';
import gamesRoutes from './routes/gamesRoutes.js';
import playerCardRoutes from './routes/playerCardRoutes.js';
import playersRoutes from './routes/playersRoutes.js';
import scoresRoutes from './routes/scoresRoutes.js';
import statsRoutes from './routes/statsRoutes.js';

const app = express();
const port = process.env.PORT || 3000;

// Configuración del middleware de caché
const cacheConfig = {
  max: parseInt(process.env.CACHE_MAX) || 100,          
  maxAge: parseInt(process.env.CACHE_MAX_AGE) || 60000,   
  enabled: process.env.CACHE_ENABLED !== 'false',        
  debug: process.env.CACHE_DEBUG === 'true'
};

// Middlewares básicos
app.use(cors());
app.use(express.json());
// Middleware de tracking (global)
app.use(trackingMiddleware);

// Middleware de caché global (se aplica a todas las rutas GET)
app.use((req, res, next) => {
  // Solo aplicar caché a métodos GET y OPTIONS
  if (req.method === 'GET' || req.method === 'OPTIONS') {
    return cacheMiddleware(cacheConfig)(req, res, next);
  }
  next();
});

// Rutas de la API
app.use('/api/players', playersRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/cards', cardsRoutes);
app.use('/api/scores', scoresRoutes);
app.use('/api', playerCardRoutes);
app.use('/api', statsRoutes);

// Rutas para gestión de caché
if (process.env.NODE_ENV === 'development' || process.env.CACHE_MANAGEMENT_ENABLED === 'true') {
  
  // Ruta para limpiar toda la caché
  app.post('/api/cache/clear', (req, res) => {
    cacheUtils.clear();
    res.json({ message: 'Cache cleared successfully' });
  });

  // Ruta para obtener estadísticas de caché
  app.get('/api/cache/stats', (req, res) => {
    const stats = cacheUtils.getStats();
    res.json(stats);
  });

  // Ruta para eliminar una entrada específica de caché
  app.delete('/api/cache/:key', (req, res) => {
    const { key } = req.params;
    cacheUtils.delete(key);
    res.json({ message: `Cache entry '${key}' deleted successfully` });
  });

  // Ruta para reconfigurar caché
  app.post('/api/cache/reconfigure', (req, res) => {
    const { max, maxAge, enabled } = req.body;
    const newConfig = { max, maxAge, enabled };
    cacheUtils.reconfigure(newConfig);
    res.json({ message: 'Cache reconfigured successfully', config: newConfig });
  });
}

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

 if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Cache middleware enabled: ${cacheConfig.enabled}`);
    console.log(`Cache max entries: ${cacheConfig.max}`);
    console.log(`Cache max age: ${cacheConfig.maxAge}ms`);
    
    if (cacheConfig.debug) {
      console.log('Cache debug mode enabled');
    }
  });
 }

export default app;