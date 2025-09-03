import { db } from './db'

// Mock PrismaClient
const mockPrismaClient = {
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $use: jest.fn(),
  $on: jest.fn(),
  $transaction: jest.fn(),
}

jest.mock('@prisma/client', () => {
  const MockPrismaClient = jest.fn(() => mockPrismaClient)
  return { PrismaClient: MockPrismaClient }
})

describe('Database configuration', () => {
  beforeEach(() => {
    // Clear global state before each test
    delete (globalThis as any).prisma
    jest.clearAllMocks()
  })

  test('should create new PrismaClient instance when not in global scope', () => {
    // Clear any existing module cache
    jest.resetModules()
    
    // Import fresh instance
    const { PrismaClient } = require('@prisma/client')
    const { db: freshDb } = require('./db')
    
    expect(PrismaClient).toHaveBeenCalledTimes(1)
    expect(PrismaClient).toHaveBeenCalledWith({
      log: ['query'],
    })
    expect(freshDb).toBe(mockPrismaClient)
  })

  test('should reuse existing PrismaClient from global scope', () => {
    // Set up global prisma instance
    ;(globalThis as any).prisma = mockPrismaClient
    
    // Clear module cache and reimport
    jest.resetModules()
    const { PrismaClient } = require('@prisma/client')
    const { db: freshDb } = require('./db')
    
    expect(PrismaClient).not.toHaveBeenCalled()
    expect(freshDb).toBe(mockPrismaClient)
  })

  test('should set global prisma in development environment', () => {
    // Store original NODE_ENV
    const originalNodeEnv = process.env.NODE_ENV
    
    // Set to development
    process.env.NODE_ENV = 'development'
    
    // Clear global prisma and module cache
    delete (globalThis as any).prisma
    jest.resetModules()
    
    // Import fresh instance
    const { db: freshDb } = require('./db')
    
    expect((globalThis as any).prisma).toBe(freshDb)
    
    // Restore original NODE_ENV
    process.env.NODE_ENV = originalNodeEnv
  })

  test('should not set global prisma in production environment', () => {
    // Store original NODE_ENV
    const originalNodeEnv = process.env.NODE_ENV
    
    // Set to production
    process.env.NODE_ENV = 'production'
    
    // Clear global prisma and module cache
    delete (globalThis as any).prisma
    jest.resetModules()
    
    // Import fresh instance
    const { db: freshDb } = require('./db')
    
    expect((globalThis as any).prisma).toBeUndefined()
    
    // Restore original NODE_ENV
    process.env.NODE_ENV = originalNodeEnv
  })
})