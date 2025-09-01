class LastCache {
  constructor(max = 100, maxAge = 60000) {
    this.max = max;
    this.maxAge = maxAge;
    this.cache = new Map();
    this.timers = new Map();
  }

  set(key, value){
    // Eliminar entrada existente si existe
    if (this.cache.has(key)) {
      this.delete(key);
    }

    // Eliminar la entrada más antigua si alcanzamos el límite
    if (this.cache.size >= this.max) {
      const oldestKey = this.cache.keys().next().value;
      this.delete(oldestKey);
    }

    // Establecer nueva entrada
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });

    // Configurar temporizador de expiración
    const timer = setTimeout(() => {
      this.delete(key);
    }, this.maxAge);

    this.timers.set(key, timer);
  }

  get(key){
    const entry = this.cache.get(key);
    
    if (!entry) {
      return undefined;
    }

    // Verificar si la entrada ha expirado
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.delete(key);
      return undefined;
    }

    // Renovar la entrada (moverla al final para LRU)
    this.delete(key);
    this.set(key, entry.value);

    return entry.value;
  }

  delete(key) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
      const timer = this.timers.get(key);
      if (timer) {
        clearTimeout(timer);
        this.timers.delete(key);
      }
    }
  }

  clear() {
    this.cache.clear();
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
  }

  size() {
    return this.cache.size;
  }

  keys() {
    return this.cache.keys();
  }

  values() {
    return Array.from(this.cache.values()).map(entry => entry.value);
  }
}

// Configuración por defecto
const defaultConfig = {
  max: 100,           // Máximo número de entradas en caché
  maxAge: 60000,       // Tiempo de expiración en milisegundos (1 minuto)
  enabled: true,       // Habilitar/deshabilitar caché
  debug: false,        // Modo debug para logging
  keyGenerator: null  // Función personalizada para generar claves
};

// Función para generar claves de caché basadas en método HTTP y URL
const defaultKeyGenerator = (req) => {
  const method = req.method.toUpperCase();
  const url = req.originalUrl || req.url;
  const queryString = req.url.split('?')[1] || '';
  
  // Incluir parámetros de consulta en la clave para diferenciar peticiones
  const key = `${method}:${url}${queryString ? '?' + queryString : ''}`;
  
  return key;
};

// Función para cargar configuración desde entorno o archivo JSON
const loadConfig = (customConfig = {}) => {
  const config = { ...defaultConfig, ...customConfig };
  
  // Sobrescribir con variables de entorno si existen
  if (process.env.CACHE_MAX) {
    config.max = parseInt(process.env.CACHE_MAX);
  }
  
  if (process.env.CACHE_MAX_AGE) {
    config.maxAge = parseInt(process.env.CACHE_MAX_AGE);
  }
  
  if (process.env.CACHE_ENABLED) {
    config.enabled = process.env.CACHE_ENABLED.toLowerCase() === 'true';
  }
  
  if (process.env.CACHE_DEBUG) {
    config.debug = process.env.CACHE_DEBUG.toLowerCase() === 'true';
  }
  
  return config;
};

// Crear instancia de caché global
let cacheInstance = null;

const getCacheInstance = (config) => {
  if (!cacheInstance) {
    cacheInstance = new LastCache(config.max, config.maxAge);
  }
  return cacheInstance;
};

// Middleware principal de caché
const cacheMiddleware = (customConfig = {}) => {
  const config = loadConfig(customConfig);
  const cache = getCacheInstance(config);
  const keyGenerator = config.keyGenerator || defaultKeyGenerator;

  return (req, res, next) => {
    // Si la caché está deshabilitada, continuar sin procesar
    if (!config.enabled) {
      if (config.debug) {
        console.log('[Cache] Cache disabled, skipping...');
      }
      return next();
    }

    // Generar clave de caché
    const cacheKey = keyGenerator(req);
    
    if (config.debug) {
      console.log(`[Cache] Generated key: ${cacheKey}`);
    }

    // Intentar obtener respuesta de caché
    const cachedResponse = cache.get(cacheKey);
    
    if (cachedResponse) {
      if (config.debug) {
        console.log(`[Cache] Cache hit for key: ${cacheKey}`);
      }
      
      // Restaurar headers de la respuesta cacheada
      if (cachedResponse.headers) {
        Object.entries(cachedResponse.headers).forEach(([key, value]) => {
          res.setHeader(key, value);
        });
      }
      
      // Enviar respuesta cacheada
      return res.status(cachedResponse.statusCode || 200).json(cachedResponse.data);
    }

    if (config.debug) {
      console.log(`[Cache] Cache miss for key: ${cacheKey}`);
    }

    // Almacenar el método original res.json
    const originalJson = res.json;
    
    // Sobrescribir res.json para interceptar la respuesta
    res.json = function(data) {
      // Restaurar el método original
      res.json = originalJson;
      
      // Crear objeto de respuesta para caché
      const responseToCache = {
        data,
        statusCode: res.statusCode,
        headers: {
          'Content-Type': res.get('Content-Type') || 'application/json',
          'X-Cache': 'HIT',
          'X-Cache-Key': cacheKey,
          'X-Cache-Timestamp': Date.now().toString()
        }
      };
      
      // Almacenar en caché solo para respuestas exitosas
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(cacheKey, responseToCache);
        
        if (config.debug) {
          console.log(`[Cache] Response cached for key: ${cacheKey}`);
          console.log(`[Cache] Cache size: ${cache.size()}/${config.max}`);
        }
        
        // Añadir header indicando que la respuesta fue cacheada
        res.setHeader('X-Cache', 'MISS');
      }
      
      // Llamar al método original con los datos
      return originalJson.call(this, data);
    };

    // Continuar con el siguiente middleware
    next();
  };
};

// Funciones utilitarias para gestión de caché
const cacheUtils = {
  // Limpiar toda la caché
  clear: () => {
    if (cacheInstance) {
      cacheInstance.clear();
      console.log('[Cache] Cache cleared');
    }
  },

  // Eliminar entrada específica
  delete: (key) => {
    if (cacheInstance) {
      cacheInstance.delete(key);
      console.log(`[Cache] Entry deleted: ${key}`);
    }
  },

  // Obtener estadísticas de caché
  getStats: () => {
    if (!cacheInstance) {
      return { size: 0, max: 0, hitRate: 0 };
    }
    
    return {
      size: cacheInstance.size(),
      max: cacheInstance.max,
      keys: Array.from(cacheInstance.keys()),
      hitRate: 'N/A' // Se podría implementar un sistema de estadísticas más avanzado
    };
  },

  // Obtener valor específico
  get: (key) => {
    return cacheInstance ? cacheInstance.get(key) : undefined;
  },

  // Establecer valor específico
  set: (key, value) => {
    if (cacheInstance) {
      cacheInstance.set(key, value);
    }
  },

  // Recrear instancia de caché con nueva configuración
  reconfigure: (newConfig) => {
    const config = loadConfig(newConfig);
    cacheInstance = new LastCache(config.max, config.maxAge);
    console.log('[Cache] Cache reconfigured with new settings');
  }
};

// Middleware para invalidar caché basado en patrones
const invalidateCache = (pattern) => {
  return (req, res, next) => {
    if (!cacheInstance) {
      return next();
    }

    const keysToDelete = [];
    
    // Buscar claves que coincidan con el patrón
    for (const key of cacheInstance.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }
    
    // Eliminar entradas coincidentes
    keysToDelete.forEach(key => {
      cacheInstance.delete(key);
    });
    
    if (keysToDelete.length > 0) {
      console.log(`[Cache] Invalidated ${keysToDelete.length} entries matching pattern: ${pattern}`);
    }
    
    next();
  };
};

// Middleware para forzar no-caché en rutas específicas
const noCache = (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
};

export default cacheMiddleware;
export {
  cacheUtils, defaultKeyGenerator, invalidateCache, LastCache,
  loadConfig, noCache
};

