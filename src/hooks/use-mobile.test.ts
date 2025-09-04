import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from '@/hooks/use-mobile';

// Mock window.matchMedia
const mockMatchMedia = jest.fn();

describe('useIsMobile Hook', () => {
  let mockMediaQueryList: any;
  let addEventListenerSpy: jest.Mock;
  let removeEventListenerSpy: jest.Mock;

  beforeEach(() => {
    // Reset window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    // Setup mock media query list
    addEventListenerSpy = jest.fn();
    removeEventListenerSpy = jest.fn();
    
    mockMediaQueryList = {
      matches: false,
      addEventListener: addEventListenerSpy,
      removeEventListener: removeEventListenerSpy,
    };

    mockMatchMedia.mockReturnValue(mockMediaQueryList);
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return false for desktop width initially', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });

  it('should return true for mobile width initially', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it('should set up media query listener on mount', () => {
    renderHook(() => useIsMobile());

    expect(mockMatchMedia).toHaveBeenCalledWith('(max-width: 767px)');
    expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should update state when media query changes', () => {
    const { result } = renderHook(() => useIsMobile());

    // Get the change handler
    const changeHandler = addEventListenerSpy.mock.calls[0][1];

    // Simulate media query change to mobile
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });
      changeHandler();
    });

    expect(result.current).toBe(true);

    // Simulate media query change to desktop
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
      changeHandler();
    });

    expect(result.current).toBe(false);
  });

  it('should clean up event listener on unmount', () => {
    const { unmount } = renderHook(() => useIsMobile());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should handle exact breakpoint boundary', () => {
    // Test at exactly 768px (should be desktop)
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });

  it('should handle one pixel below breakpoint', () => {
    // Test at 767px (should be mobile)
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 767,
    });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it('should handle very small screen width', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 320,
    });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it('should handle very large screen width', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 2560,
    });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });

  it('should return boolean value', () => {
    const { result } = renderHook(() => useIsMobile());

    expect(typeof result.current).toBe('boolean');
  });

  it('should not throw errors when window is undefined (SSR)', () => {
    const originalWindow = global.window;
    
    // @ts-ignore
    delete global.window;
    
    expect(() => {
      renderHook(() => useIsMobile());
    }).not.toThrow();
    
    global.window = originalWindow;
  });
});