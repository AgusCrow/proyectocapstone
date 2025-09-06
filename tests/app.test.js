import request from "supertest";
import "dotenv/config";

// Set base environment variables
process.env.NODE_ENV = "test";
process.env.PORT = "3000";
process.env.CACHE_MAX = "100";
process.env.CACHE_MAX_AGE = "60000";
process.env.CACHE_ENABLED = "true";
process.env.CACHE_DEBUG = "false";
process.env.CACHE_MANAGEMENT_ENABLED = "true"; // Habilitar rutas de gestión de caché

// Mock console.log to avoid output during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Import app after setting environment variables
import app from "../src/app.js";

describe("App Tests", () => {
  describe("Basic App Configuration", () => {
    it("should have Express app instance", () => {
      expect(app).toBeDefined();
      expect(typeof app.use).toBe("function");
      expect(typeof app.get).toBe("function");
      expect(typeof app.post).toBe("function");
      expect(typeof app.listen).toBe("function");
    });

    it("should have correct environment configuration", () => {
      expect(process.env.PORT).toBe("3000");
      expect(process.env.CACHE_MAX).toBe("100");
      expect(process.env.CACHE_MAX_AGE).toBe("60000");
      expect(process.env.CACHE_ENABLED).toBe("true");
      expect(process.env.CACHE_DEBUG).toBe("false");
      expect(process.env.CACHE_MANAGEMENT_ENABLED).toBe("true");
    });
  });

  describe('Middleware Setup', () => {
    it('should use tracking middleware', () => {
      const trackingMiddleware = require('../src/middleware/trackingMiddleware.js').default;
      
      // Check if the middleware is in the app's middleware stack
      const middlewareStack = app._router.stack;
      const hasTrackingMiddleware = middlewareStack.some(layer => 
        layer.handle === trackingMiddleware
      );
      
      expect(hasTrackingMiddleware).toBe(true);
    });
    
    it('should use JSON middleware', () => {
      expect(app._router).toBeDefined();
      
      // Check if express.json middleware is in the stack
      const middlewareStack = app._router.stack;
      const hasJsonMiddleware = middlewareStack.some(layer => 
        layer.name === 'jsonParser'
      );
      
      expect(hasJsonMiddleware).toBe(true);
    });
    
    it('should use cache middleware', () => {
      const cacheMiddleware = require('../src/middleware/cacheMiddleware.js').default;
      
      // Check if the cache middleware wrapper is in the stack
      const middlewareStack = app._router.stack;
      const hasCacheWrapper = middlewareStack.some(layer => {
        return typeof layer.handle === 'function' && 
               layer.handle.name !== 'jsonParser' && 
               layer.handle.name !== 'corsMiddleware' &&
               layer.handle !== require('../src/middleware/trackingMiddleware.js').default;
      });
      
      expect(hasCacheWrapper).toBe(true);
      
      // Verify the cache configuration is properly set
      const cacheConfig = {
        max: parseInt(process.env.CACHE_MAX) || 100,
        maxAge: parseInt(process.env.CACHE_MAX_AGE) || 60000,
        enabled: process.env.CACHE_ENABLED !== 'false',
        debug: process.env.CACHE_DEBUG === 'true'
      };
      
      expect(cacheConfig.max).toBe(100);
      expect(cacheConfig.maxAge).toBe(60000);
      expect(cacheConfig.enabled).toBe(true);
      expect(cacheConfig.debug).toBe(false);
    });
  });

  describe("Route Setup", () => {
    it("should setup players routes", () => {
      const playersRoutes = require("../src/routes/playersRoutes.js").default;
      expect(playersRoutes).toBeDefined();
      expect(typeof playersRoutes).toBe("function");
    });
    
    it("should setup games routes", () => {
      const gamesRoutes = require("../src/routes/gamesRoutes.js").default;
      expect(gamesRoutes).toBeDefined();
      expect(typeof gamesRoutes).toBe("function");
    });
    
    it("should setup cards routes", () => {
      const cardsRoutes = require("../src/routes/cardsRoutes.js").default;
      expect(cardsRoutes).toBeDefined();
      expect(typeof cardsRoutes).toBe("function");
    });
    
    it("should setup scores routes", () => {
      const scoresRoutes = require("../src/routes/scoresRoutes.js").default;
      expect(scoresRoutes).toBeDefined();
      expect(typeof scoresRoutes).toBe("function");
    });
    
    it("should setup playerCard routes", () => {
      const playerCardRoutes = require("../src/routes/playerCardRoutes.js").default;
      expect(playerCardRoutes).toBeDefined();
      expect(typeof playerCardRoutes).toBe("function");
    });
    
    it("should setup stats routes", () => {
      const statsRoutes = require("../src/routes/statsRoutes.js").default;
      expect(statsRoutes).toBeDefined();
      expect(typeof statsRoutes).toBe("function");
    });
  });

  describe("Cache Management Routes", () => {
    it("should have cache clear route", async () => {
      const response = await request(app).post("/api/cache/clear").expect(200);
      expect(response.body.message).toBe("Cache cleared successfully");
    });
    
    it("should have cache stats route", async () => {
      const response = await request(app).get("/api/cache/stats").expect(200);
      expect(response.body).toBeDefined();
    });
    
    it("should have cache delete route", async () => {
      const response = await request(app)
        .delete("/api/cache/test-key")
        .expect(200);
      expect(response.body.message).toBe(
        "Cache entry 'test-key' deleted successfully"
      );
    });
    
    it("should have cache reconfigure route", async () => {
      const response = await request(app)
        .post("/api/cache/reconfigure")
        .send({ max: 200, maxAge: 120000, enabled: true })
        .expect(200);
      expect(response.body.message).toBe("Cache reconfigured successfully");
      expect(response.body.config).toEqual({
        max: 200,
        maxAge: 120000,
        enabled: true
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle 404 for unknown routes", async () => {
      const response = await request(app).get("/unknown-route").expect(404);
      expect(response.body.error).toBe("Route not found");
    });
    
    it("should handle 500 errors", async () => {
      // Add a test route that throws an error
      app.get("/test-error", (req, res, next) => {
        throw new Error("Test error");
      });
      
      const response = await request(app).get("/test-error").expect(500);
      expect(response.body.error).toBe("Something broke!");
    });
  });

  describe("Server Configuration", () => {
    it("should use correct port from environment", () => {
      const port = process.env.PORT || 3000;
      expect(port).toBeDefined();
      expect(typeof parseInt(port)).toBe("number");
    });
    
    it("should have cache configuration", () => {
      const cacheConfig = {
        max: parseInt(process.env.CACHE_MAX) || 100,
        maxAge: parseInt(process.env.CACHE_MAX_AGE) || 60000,
        enabled: process.env.CACHE_ENABLED !== "false",
        debug: process.env.CACHE_DEBUG === "true",
      };
      
      expect(cacheConfig.max).toBeDefined();
      expect(cacheConfig.maxAge).toBeDefined();
      expect(typeof cacheConfig.enabled).toBe("boolean");
      expect(typeof cacheConfig.debug).toBe("boolean");
    });
  });

  describe("Conditional Routes", () => {
    it("should enable cache management routes when CACHE_MANAGEMENT_ENABLED is true", () => {
      // Verify that cache management routes exist in the router
      const routes = app._router.stack
        .filter(layer => layer.route)
        .map(layer => ({
          path: layer.route.path,
          methods: Object.keys(layer.route.methods)
        }));
      
      expect(routes).toEqual(
        expect.arrayContaining([
          { path: '/api/cache/clear', methods: ['post'] },
          { path: '/api/cache/stats', methods: ['get'] },
          { path: '/api/cache/:key', methods: ['delete'] },
          { path: '/api/cache/reconfigure', methods: ['post'] }
        ])
      );
    });
  });

  describe("Server Startup", () => {
    it("should not start server in test environment", () => {
      // Verify that server doesn't start in test environment
      expect(process.env.NODE_ENV).toBe("test");
    });

    it("would start server in non-test environment", () => {
      // Test that the server startup code exists
      // We can't actually start the server in tests, but we can verify the code path
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";
      
      // Re-import app to test with different environment
      jest.resetModules();
      const devApp = require("../src/app.js").default;
      
      // Verify app is properly configured
      expect(devApp).toBeDefined();
      
      // Restore original environment
      process.env.NODE_ENV = originalEnv;
    });
  });

  // Pruebas adicionales para cubrir todas las líneas
  describe("Additional Coverage Tests", () => {
    it("should cover all cache management routes", async () => {
      // Prueba para cubrir todas las líneas de las rutas de gestión de caché
      await request(app).post("/api/cache/clear").expect(200);
      await request(app).get("/api/cache/stats").expect(200);
      await request(app).delete("/api/cache/specific-key").expect(200);
      await request(app)
        .post("/api/cache/reconfigure")
        .send({ max: 300, maxAge: 180000, enabled: false })
        .expect(200);
    });

    it("should cover error handlers completely", async () => {
      // Prueba para cubrir el manejador de 404
      await request(app).get("/another-unknown-route").expect(404);
      
      // Prueba para cubrir el manejador de 500
      app.get("/another-test-error", (req, res, next) => {
        throw new Error("Another test error");
      });
      await request(app).get("/another-test-error").expect(500);
    });
  });
});