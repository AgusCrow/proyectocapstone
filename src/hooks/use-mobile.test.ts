import { useIsMobile } from './use-mobile'
import { renderHook, act } from '@testing-library/react'

// Mock window.matchMedia
const mockMatchMedia = jest.fn()
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
})

describe('useIsMobile hook', () => {
  beforeEach(() => {
    mockMatchMedia.mockClear()
  })

  test('should return false when window width is greater than breakpoint', () => {
    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    const mockMediaQueryList = {
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }
    mockMatchMedia.mockReturnValue(mockMediaQueryList)

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(false)
    expect(mockMatchMedia).toHaveBeenCalledWith('(max-width: 767px)')
    expect(mockMediaQueryList.addEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })

  test('should return true when window width is less than breakpoint', () => {
    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    })

    const mockMediaQueryList = {
      matches: true,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }
    mockMatchMedia.mockReturnValue(mockMediaQueryList)

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(true)
    expect(mockMatchMedia).toHaveBeenCalledWith('(max-width: 767px)')
  })

  test('should update when media query changes', () => {
    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    let changeCallback: ((event: any) => void) | null = null

    const mockMediaQueryList = {
      matches: false,
      addEventListener: jest.fn((event, callback) => {
        if (event === 'change') {
          changeCallback = callback
        }
      }),
      removeEventListener: jest.fn(),
    }
    mockMatchMedia.mockReturnValue(mockMediaQueryList)

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(false)

    // Simulate window resize to mobile size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    })

    // Trigger the change callback
    if (changeCallback) {
      act(() => {
        changeCallback!({ matches: true })
      })
    }

    expect(result.current).toBe(true)
  })

  test('should clean up event listener on unmount', () => {
    const mockMediaQueryList = {
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }
    mockMatchMedia.mockReturnValue(mockMediaQueryList)

    const { unmount } = renderHook(() => useIsMobile())

    expect(mockMediaQueryList.addEventListener).toHaveBeenCalledWith('change', expect.any(Function))

    unmount()

    expect(mockMediaQueryList.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })

  test('should handle undefined state initially', () => {
    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    const mockMediaQueryList = {
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }
    mockMatchMedia.mockReturnValue(mockMediaQueryList)

    const { result } = renderHook(() => useIsMobile())

    // The hook should return a boolean (not undefined) due to the !! conversion
    expect(typeof result.current).toBe('boolean')
  })
})