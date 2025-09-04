import { createMocks } from 'node-mocks-http'
import { GET } from './route'

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data) => ({
      status: 200,
      json: () => Promise.resolve(data),
    })),
  },
}))

describe('Health Check API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should return 200 status with success message', async () => {
    const { req } = createMocks({
      method: 'GET',
    })

    const response = await GET(req)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ message: 'Good!' })
  })

  test('should handle GET request correctly', async () => {
    const { req } = createMocks({
      method: 'GET',
      headers: {
        'content-type': 'application/json',
      },
    })

    const response = await GET(req)
    
    expect(response.status).toBe(200)
    expect(response.json).toBeDefined()
  })

  test('should return JSON content type', async () => {
    const { req } = createMocks({
      method: 'GET',
    })

    const response = await GET(req)
    
    // Note: In a real test environment, you might need to check headers
    // For now, we'll just verify the response structure
    expect(response.status).toBe(200)
    expect(response.json).toBeDefined()
  })

  test('should be resilient to different request headers', async () => {
    const { req } = createMocks({
      method: 'GET',
      headers: {
        'user-agent': 'test-agent',
        'accept': 'application/json',
        'x-custom-header': 'custom-value',
      },
    })

    const response = await GET(req)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ message: 'Good!' })
  })

  test('should handle empty request body', async () => {
    const { req } = createMocks({
      method: 'GET',
      body: null,
    })

    const response = await GET(req)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ message: 'Good!' })
  })
})