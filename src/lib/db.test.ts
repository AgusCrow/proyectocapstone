import { db } from './db'

// Mock PrismaClient
const mockPrismaClient = {
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $use: jest.fn(),
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  post: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $transaction: jest.fn(),
}

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrismaClient),
}))

describe('Database Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Clear global prisma instance
    delete (globalThis as any).prisma
  })

  test('should create new PrismaClient instance when none exists', () => {
    const { db: dbInstance } = require('./db')
    
    expect(dbInstance).toBe(mockPrismaClient)
  })

  test('should reuse existing PrismaClient instance', () => {
    // First import
    const { db: db1 } = require('./db')
    
    // Second import should return same instance
    const { db: db2 } = require('./db')
    
    expect(db1).toBe(db2)
  })

  test('should configure PrismaClient with query logging', () => {
    // We need to reset the module cache and mock before importing
    jest.resetModules()
    
    const { PrismaClient } = require('@prisma/client')
    
    // Import after mocking
    const { db } = require('./db')
    
    // Check if PrismaClient was called with the correct config
    expect(PrismaClient).toHaveBeenCalled()
    const callArgs = PrismaClient.mock.calls[0][0]
    expect(callArgs.log).toEqual(['query'])
  })

  test('should store PrismaClient in globalThis in development', () => {
    // Store original NODE_ENV
    const originalNodeEnv = process.env.NODE_ENV
    
    // Set to development
    process.env.NODE_ENV = 'development'
    
    // Clear module cache
    jest.resetModules()
    
    const { db: dbInstance } = require('./db')
    
    expect((globalThis as any).prisma).toBe(dbInstance)
    
    // Restore original NODE_ENV
    process.env.NODE_ENV = originalNodeEnv
  })

  test('should not store PrismaClient in globalThis in production', () => {
    // Store original NODE_ENV
    const originalNodeEnv = process.env.NODE_ENV
    
    // Set to production
    process.env.NODE_ENV = 'production'
    
    // Clear global prisma
    delete (globalThis as any).prisma
    
    // Clear module cache
    jest.resetModules()
    
    const { db: dbInstance } = require('./db')
    
    expect((globalThis as any).prisma).toBeUndefined()
    
    // Restore original NODE_ENV
    process.env.NODE_ENV = originalNodeEnv
  })

  test('should handle undefined NODE_ENV', () => {
    // Store original NODE_ENV
    const originalNodeEnv = process.env.NODE_ENV
    
    // Set to undefined
    delete process.env.NODE_ENV
    
    // Clear global prisma
    delete (globalThis as any).prisma
    
    // Clear module cache
    jest.resetModules()
    
    const { db: dbInstance } = require('./db')
    
    // Should still work and store in global
    expect((globalThis as any).prisma).toBe(dbInstance)
    
    // Restore original NODE_ENV
    process.env.NODE_ENV = originalNodeEnv
  })

  test('should export database client with expected methods', () => {
    const { db: dbInstance } = require('./db')
    
    expect(dbInstance).toHaveProperty('$connect')
    expect(dbInstance).toHaveProperty('$disconnect')
    expect(dbInstance).toHaveProperty('$use')
    expect(dbInstance).toHaveProperty('user')
    expect(dbInstance).toHaveProperty('post')
    expect(dbInstance).toHaveProperty('$transaction')
  })

  test('should have user model methods', () => {
    const { db: dbInstance } = require('./db')
    
    expect(dbInstance.user).toHaveProperty('findMany')
    expect(dbInstance.user).toHaveProperty('findUnique')
    expect(dbInstance.user).toHaveProperty('create')
    expect(dbInstance.user).toHaveProperty('update')
    expect(dbInstance.user).toHaveProperty('delete')
  })

  test('should have post model methods', () => {
    const { db: dbInstance } = require('./db')
    
    expect(dbInstance.post).toHaveProperty('findMany')
    expect(dbInstance.post).toHaveProperty('findUnique')
    expect(dbInstance.post).toHaveProperty('create')
    expect(dbInstance.post).toHaveProperty('update')
    expect(dbInstance.post).toHaveProperty('delete')
  })

  test('should be importable multiple times without errors', () => {
    expect(() => {
      const { db: db1 } = require('./db')
      const { db: db2 } = require('./db')
      const { db: db3 } = require('./db')
      
      expect(db1).toBe(db2)
      expect(db2).toBe(db3)
    }).not.toThrow()
  })
})