import { GET } from '@/app/api/health/route';
import { NextResponse } from 'next/server';

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn(),
  },
}));

describe('Health API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a successful response', async () => {
    // Mock the NextResponse.json implementation
    const mockJsonResponse = { message: 'Good!' };
    (NextResponse.json as jest.Mock).mockReturnValue(mockJsonResponse);

    const response = await GET();

    expect(NextResponse.json).toHaveBeenCalledWith({ message: 'Good!' });
    expect(response).toEqual(mockJsonResponse);
  });

  it('should return correct message structure', async () => {
    const mockJsonResponse = { message: 'Good!' };
    (NextResponse.json as jest.Mock).mockReturnValue(mockJsonResponse);

    await GET();

    // Verify the exact structure passed to NextResponse.json
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringMatching('Good!'),
      })
    );
  });

  it('should handle GET method correctly', async () => {
    const mockJsonResponse = { message: 'Good!' };
    (NextResponse.json as jest.Mock).mockReturnValue(mockJsonResponse);

    const response = await GET();

    expect(response).toBeDefined();
    expect(typeof response).toBe('object');
  });
});