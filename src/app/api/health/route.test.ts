import { GET } from './route'
import { NextResponse } from 'next/server'

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn(),
  },
}))

describe('Health API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should return successful health check response', async () => {
    const mockJsonResponse = { message: 'Good!' }
    ;(NextResponse.json as jest.Mock).mockReturnValue(mockJsonResponse)

    const response = await GET()

    expect(NextResponse.json).toHaveBeenCalledWith({ message: 'Good!' })
    expect(response).toEqual(mockJsonResponse)
  })

  test('should handle GET request correctly', async () => {
    const mockJsonResponse = { message: 'Good!' }
    ;(NextResponse.json as jest.Mock).mockReturnValue(mockJsonResponse)

    const response = await GET()

    expect(response).toBeDefined()
    expect(typeof response).toBe('object')
  })

  test('should return correct response structure', async () => {
    const mockJsonResponse = { message: 'Good!' }
    ;(NextResponse.json as jest.Mock).mockReturnValue(mockJsonResponse)

    const response = await GET()

    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.any(String),
      })
    )
  })
})