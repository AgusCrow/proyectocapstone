// cacheMiddleware.test.js
import cacheMiddleware, { cacheUtils, LastCache, invalidateCache, noCache, loadConfig, defaultKeyGenerator } from '../src/middleware/cacheMiddleware.js';

describe('Cache Middleware', () => {
  let req, res, next;
  
  beforeEach(() => {
    req = {
      method: 'GET',
      originalUrl: '/api/test',
      url: '/api/test'
    };
    res = {
      setHeader: jest.fn(),
      get: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
    // Reset cache instance for each test
    cacheUtils.clear();
  });

  describe('LastCache class', () => {
    let cache;
    
    beforeEach(() => {
      cache = new LastCache(3, 1000); // Small cache for testing
    });
    
    it('should initialize with empty cache and timers', () => {
      expect(cache.cache).toBeInstanceOf(Map);
      expect(cache.timers).toBeInstanceOf(Map);
      expect(cache.cache.size).toBe(0);
      expect(cache.timers.size).toBe(0);
    });
    
    it('should delete existing entry when setting same key', () => {
      const deleteSpy = jest.spyOn(cache, 'delete');
      cache.set('key1', 'value1');
      expect(deleteSpy).toHaveBeenCalledWith('key1');
      deleteSpy.mockRestore();
    });
    
    it('should delete oldest entry when cache is full', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      
      // All keys should be present
      expect(cache.get('key1')).toBe('value1');
      expect(cache.get('key2')).toBe('value2');
      expect(cache.get('key3')).toBe('value3');
      
      // Add one more entry, should evict key1
      cache.set('key4', 'value4');
      
      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBe('value2');
      expect(cache.get('key3')).toBe('value3');
      expect(cache.get('key4')).toBe('value4');
    });
    
    it('should return undefined for expired entries', (done) => {
      cache.set('key1', 'value1');
      
      setTimeout(() => {
        expect(cache.get('key1')).toBeUndefined();
        done();
      }, 1100); // Slightly longer than maxAge (1000ms)
    });
    
    it('should clear all entries and timers', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      expect(cache.size()).toBe(2);
      
      cache.clear();
      expect(cache.size()).toBe(0);
      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBeUndefined();
    });
    
    it('should return cache keys iterator', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      const keys = Array.from(cache.keys());
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
    });
    
    it('should return all cached values', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      const values = cache.values();
      expect(values).toEqual(expect.arrayContaining(['value1', 'value2']));
    });
  });

  describe('loadConfig function', () => {
    const originalEnv = process.env;
    
    afterEach(() => {
      process.env = originalEnv;
    });
    
    it('should use default values when no config provided', () => {
      const config = loadConfig();
      expect(config).toEqual({
        max: 100,
        maxAge: 60000,
        enabled: true,
        debug: false,
        keyGenerator: null
      });
    });
    
    it('should load values from environment variables', () => {
      process.env.CACHE_MAX = '300';
      process.env.CACHE_MAX_AGE = '120000';
      process.env.CACHE_ENABLED = 'false';
      process.env.CACHE_DEBUG = 'true';
      
      const config = loadConfig();
      expect(config.max).toBe(300);
      expect(config.maxAge).toBe(120000);
      expect(config.enabled).toBe(false);
      expect(config.debug).toBe(true);
    });
    
    it('should handle invalid environment variable values', () => {
      process.env.CACHE_MAX = 'invalid';
      process.env.CACHE_ENABLED = 'maybe';
      
      const config = loadConfig();
      expect(config.max).toBeNaN();
      expect(config.enabled).toBe(false); // 'maybe' !== 'true'
    });
  });

  describe('getCacheInstance', () => {
    it('should create a new cache instance if none exists', () => {
      // Clear existing instance
      cacheUtils.clear();
      cacheUtils.reconfigure({});
      cacheUtils.clear();
      
      const config = { max: 50, maxAge: 30000 };
      const instance = cacheMiddleware.__getCacheInstance(config);
      expect(instance).toBeInstanceOf(LastCache);
      expect(instance.max).toBe(50);
      expect(instance.maxAge).toBe(30000);
    });
    
    it('should return existing cache instance if one exists', () => {
      const config1 = { max: 50, maxAge: 30000 };
      const instance1 = cacheMiddleware.__getCacheInstance(config1);
      
      const config2 = { max: 100, maxAge: 60000 };
      const instance2 = cacheMiddleware.__getCacheInstance(config2);
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('cache middleware', () => {
    it('should skip processing when cache is disabled', () => {
      const middleware = cacheMiddleware({ enabled: false, debug: true });
      const consoleSpy = jest.spyOn(console, 'log');
      
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('[Cache] Cache disabled, skipping...');
      consoleSpy.mockRestore();
    });
    
    it('should generate cache key using default generator', () => {
      const middleware = cacheMiddleware({ enabled: true, debug: true });
      const consoleSpy = jest.spyOn(console, 'log');
      
      middleware(req, res, next);
      
      expect(consoleSpy).toHaveBeenCalledWith('[Cache] Generated key: GET:/api/test');
      consoleSpy.mockRestore();
    });
    
    it('should serve cached response when available', () => {
      // Pre-populate cache
      cacheUtils.set('GET:/api/test', {
        data: { cached: true },
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      
      const middleware = cacheMiddleware({ enabled: true, debug: true });
      const consoleSpy = jest.spyOn(console, 'log');
      
      middleware(req, res, next);
      
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ cached: true });
      expect(next).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('[Cache] Cache hit for key: GET:/api/test');
      consoleSpy.mockRestore();
    });
    
    it('should cache successful responses', (done) => {
      const middleware = cacheMiddleware({ enabled: true, debug: true });
      const consoleSpy = jest.spyOn(console, 'log');
      
      middleware(req, res, () => {
        // Simulate a successful response
        res.statusCode = 200;
        res.json({ data: 'test' });
        
        setTimeout(() => {
          const cachedResponse = cacheUtils.get('GET:/api/test');
          expect(cachedResponse).toBeDefined();
          expect(cachedResponse.data).toEqual({ data: 'test' });
          expect(consoleSpy).toHaveBeenCalledWith('[Cache] Response cached for key: GET:/api/test');
          expect(consoleSpy).toHaveBeenCalledWith('[Cache] Cache size: 1/100');
          consoleSpy.mockRestore();
          done();
        }, 10);
      });
    });
    
    it('should not cache non-successful responses', (done) => {
      const middleware = cacheMiddleware({ enabled: true });
      
      middleware(req, res, () => {
        // Simulate an error response
        res.statusCode = 404;
        res.json({ error: 'Not found' });
        
        setTimeout(() => {
          const cachedResponse = cacheUtils.get('GET:/api/test');
          expect(cachedResponse).toBeUndefined();
          done();
        }, 10);
      });
    });
    
    it('should set X-Cache header to MISS for new responses', (done) => {
      const middleware = cacheMiddleware({ enabled: true });
      
      middleware(req, res, () => {
        res.statusCode = 200;
        res.json({ data: 'test' });
        
        setTimeout(() => {
          expect(res.setHeader).toHaveBeenCalledWith('X-Cache', 'MISS');
          done();
        }, 10);
      });
    });
  });

  describe('cache utils', () => {
    it('should clear cache when instance exists', () => {
      cacheUtils.set('key1', 'value1');
      cacheUtils.set('key2', 'value2');
      
      expect(cacheUtils.getStats().size).toBe(2);
      
      cacheUtils.clear();
      expect(cacheUtils.getStats().size).toBe(0);
    });
    
    it('should handle clear when no instance exists', () => {
      // Clear existing instance
      cacheUtils.clear();
      cacheUtils.reconfigure({});
      cacheUtils.clear();
      
      expect(() => cacheUtils.clear()).not.toThrow();
    });
    
    it('should delete cache entry', () => {
      cacheUtils.set('test-key', { data: 'test' });
      expect(cacheUtils.get('test-key')).toBeDefined();
      
      cacheUtils.delete('test-key');
      expect(cacheUtils.get('test-key')).toBeUndefined();
    });
    
    it('should handle delete when no instance exists', () => {
      // Clear existing instance
      cacheUtils.clear();
      cacheUtils.reconfigure({});
      cacheUtils.clear();
      
      expect(() => cacheUtils.delete('test-key')).not.toThrow();
    });
    
    it('should get cache stats', () => {
      cacheUtils.set('key1', 'value1');
      cacheUtils.set('key2', 'value2');
      
      const stats = cacheUtils.getStats();
      expect(stats.size).toBe(2);
      expect(stats.max).toBe(100); // default max
      expect(stats.keys).toContain('key1');
      expect(stats.keys).toContain('key2');
    });
    
    it('should return empty stats when no instance exists', () => {
      // Clear existing instance
      cacheUtils.clear();
      cacheUtils.reconfigure({});
      cacheUtils.clear();
      
      const stats = cacheUtils.getStats();
      expect(stats.size).toBe(0);
      expect(stats.max).toBe(0);
    });
    
    it('should set and get values', () => {
      cacheUtils.set('test-key', 'test-value');
      expect(cacheUtils.get('test-key')).toBe('test-value');
    });
    
    it('should handle get when no instance exists', () => {
      // Clear existing instance
      cacheUtils.clear();
      cacheUtils.reconfigure({});
      cacheUtils.clear();
      
      expect(cacheUtils.get('test-key')).toBeUndefined();
    });
    
    it('should handle set when no instance exists', () => {
      // Clear existing instance
      cacheUtils.clear();
      cacheUtils.reconfigure({});
      cacheUtils.clear();
      
      expect(() => cacheUtils.set('test-key', 'test-value')).not.toThrow();
    });
    
    it('should reconfigure cache', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      cacheUtils.reconfigure({ max: 200, maxAge: 120000 });
      
      const stats = cacheUtils.getStats();
      expect(stats.max).toBe(200);
      
      expect(consoleSpy).toHaveBeenCalledWith('[Cache] Cache reconfigured with new settings');
      consoleSpy.mockRestore();
    });
  });

  describe('invalidateCache middleware', () => {
    beforeEach(() => {
      // Pre-populate cache
      cacheUtils.set('GET:/api/users', { data: 'users' });
      cacheUtils.set('GET:/api/users/1', { data: 'user1' });
      cacheUtils.set('GET:/api/posts', { data: 'posts' });
    });
    
    it('should invalidate cache entries matching pattern', () => {
      const middleware = invalidateCache('/api/users');
      
      middleware(req, res, next);
      
      expect(cacheUtils.get('GET:/api/users')).toBeUndefined();
      expect(cacheUtils.get('GET:/api/users/1')).toBeUndefined();
      expect(cacheUtils.get('GET:/api/posts')).toBeDefined(); // Should not be invalidated
      expect(next).toHaveBeenCalled();
    });
    
    it('should do nothing when no entries match pattern', () => {
      const middleware = invalidateCache('/nonexistent');
      
      middleware(req, res, next);
      
      // All entries should still exist
      expect(cacheUtils.get('GET:/api/users')).toBeDefined();
      expect(cacheUtils.get('GET:/api/users/1')).toBeDefined();
      expect(cacheUtils.get('GET:/api/posts')).toBeDefined();
      expect(next).toHaveBeenCalled();
    });
    
    it('should do nothing when cache instance does not exist', () => {
      // Clear the cache instance
      cacheUtils.clear();
      cacheUtils.reconfigure({});
      cacheUtils.clear();
      
      const middleware = invalidateCache('/api/users');
      
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });
  });

  describe('noCache middleware', () => {
    it('should set appropriate cache control headers', () => {
      noCache(req, res, next);
      
      expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      expect(res.setHeader).toHaveBeenCalledWith('Pragma', 'no-cache');
      expect(res.setHeader).toHaveBeenCalledWith('Expires', '0');
      expect(res.setHeader).toHaveBeenCalledWith('Surrogate-Control', 'no-store');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('defaultKeyGenerator', () => {
    it('should generate keys with method and URL', () => {
      req.method = 'GET';
      req.originalUrl = '/api/users';
      req.url = '/api/users';
      
      const key = defaultKeyGenerator(req);
      expect(key).toBe('GET:/api/users');
    });
    
    it('should include query parameters in the key', () => {
      req.method = 'GET';
      req.originalUrl = '/api/users';
      req.url = '/api/users?page=1&limit=10';
      
      const key = defaultKeyGenerator(req);
      expect(key).toBe('GET:/api/users?page=1&limit=10');
    });
    
    it('should handle uppercase methods', () => {
      req.method = 'post';
      req.originalUrl = '/api/users';
      req.url = '/api/users';
      
      const key = defaultKeyGenerator(req);
      expect(key).toBe('POST:/api/users');
    });
    
    it('should handle URLs without query parameters', () => {
      req.method = 'GET';
      req.originalUrl = '/api/users';
      req.url = '/api/users';
      
      const key = defaultKeyGenerator(req);
      expect(key).toBe('GET:/api/users');
    });
  });
});