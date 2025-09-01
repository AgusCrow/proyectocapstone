// Configuración global para tests
import dotenv from 'dotenv';

// Cargar variables de entorno para testing
dotenv.config({ path: '.env.test' });

// Configuración global para Jest
if (typeof jest !== 'undefined') {
  // Silenciar logs durante los tests
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
} 