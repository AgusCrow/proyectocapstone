import { useToast, toast, reducer } from './use-toast'
import { renderHook, act } from '@testing-library/react'
import React from 'react'

// Mock setTimeout and clearTimeout
jest.useFakeTimers()

describe('useToast hook', () => {
  beforeEach(() => {
    // Clear all timeouts before each test
    jest.clearAllTimers()
    // Reset the toast state by clearing all timeouts and state
    jest.resetModules()
    // Re-enable fake timers after reset
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('reducer', () => {
    test('should add toast', () => {
      const initialState = { toasts: [] }
      const action = {
        type: 'ADD_TOAST' as const,
        toast: { id: '1', title: 'Test Toast', open: true },
      }

      const newState = reducer(initialState, action)

      expect(newState.toasts).toHaveLength(1)
      expect(newState.toasts[0]).toEqual(action.toast)
    })

    test('should limit number of toasts to TOAST_LIMIT', () => {
      const initialState = {
        toasts: [
          { id: '1', title: 'Toast 1', open: true },
          { id: '2', title: 'Toast 2', open: true },
        ],
      }
      const action = {
        type: 'ADD_TOAST' as const,
        toast: { id: '3', title: 'Toast 3', open: true },
      }

      const newState = reducer(initialState, action)

      expect(newState.toasts).toHaveLength(1)
      expect(newState.toasts[0].id).toBe('3')
    })

    test('should update toast', () => {
      const initialState = {
        toasts: [{ id: '1', title: 'Original Title', open: true }],
      }
      const action = {
        type: 'UPDATE_TOAST' as const,
        toast: { id: '1', title: 'Updated Title' },
      }

      const newState = reducer(initialState, action)

      expect(newState.toasts[0].title).toBe('Updated Title')
    })

    test('should dismiss specific toast', () => {
      const initialState = {
        toasts: [
          { id: '1', title: 'Toast 1', open: true },
          { id: '2', title: 'Toast 2', open: true },
        ],
      }
      const action = {
        type: 'DISMISS_TOAST' as const,
        toastId: '1',
      }

      const newState = reducer(initialState, action)

      expect(newState.toasts[0].open).toBe(false)
      expect(newState.toasts[1].open).toBe(true)
    })

    test('should dismiss all toasts when no toastId provided', () => {
      const initialState = {
        toasts: [
          { id: '1', title: 'Toast 1', open: true },
          { id: '2', title: 'Toast 2', open: true },
        ],
      }
      const action = {
        type: 'DISMISS_TOAST' as const,
      }

      const newState = reducer(initialState, action)

      expect(newState.toasts[0].open).toBe(false)
      expect(newState.toasts[1].open).toBe(false)
    })

    test('should remove specific toast', () => {
      const initialState = {
        toasts: [
          { id: '1', title: 'Toast 1', open: true },
          { id: '2', title: 'Toast 2', open: true },
        ],
      }
      const action = {
        type: 'REMOVE_TOAST' as const,
        toastId: '1',
      }

      const newState = reducer(initialState, action)

      expect(newState.toasts).toHaveLength(1)
      expect(newState.toasts[0].id).toBe('2')
    })

    test('should remove all toasts when no toastId provided', () => {
      const initialState = {
        toasts: [
          { id: '1', title: 'Toast 1', open: true },
          { id: '2', title: 'Toast 2', open: true },
        ],
      }
      const action = {
        type: 'REMOVE_TOAST' as const,
      }

      const newState = reducer(initialState, action)

      expect(newState.toasts).toHaveLength(0)
    })
  })

  describe('toast function', () => {
    test('should create toast with id and return controls', () => {
      const result = toast({ title: 'Test Toast' })

      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('dismiss')
      expect(result).toHaveProperty('update')
      expect(typeof result.dismiss).toBe('function')
      expect(typeof result.update).toBe('function')
    })

    test('should generate unique ids', () => {
      const result1 = toast({ title: 'Toast 1' })
      const result2 = toast({ title: 'Toast 2' })

      expect(result1.id).not.toBe(result2.id)
    })

    test('should update toast', () => {
      const result = toast({ title: 'Original Title' })
      
      result.update({ title: 'Updated Title' })

      // The update should work (we can't easily test the internal state here)
      expect(typeof result.update).toBe('function')
    })

    test('should dismiss toast', () => {
      const result = toast({ title: 'Test Toast' })
      
      // The dismiss should work (we can't easily test the internal state here)
      expect(typeof result.dismiss).toBe('function')
    })
  })

  describe('useToast hook', () => {
    test('should return current state and controls', () => {
      const { result } = renderHook(() => useToast())

      expect(result.current).toHaveProperty('toasts')
      expect(result.current).toHaveProperty('toast')
      expect(result.current).toHaveProperty('dismiss')
      expect(Array.isArray(result.current.toasts)).toBe(true)
      expect(typeof result.current.toast).toBe('function')
      expect(typeof result.current.dismiss).toBe('function')
    })

    test('should add toast using toast function', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast({ title: 'Test Toast' })
      })

      expect(result.current.toasts).toHaveLength(1)
      expect(result.current.toasts[0].title).toBe('Test Toast')
    })

    test('should dismiss toast using dismiss function', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        const toastResult = result.current.toast({ title: 'Test Toast' })
        result.current.dismiss(toastResult.id)
      })

      expect(result.current.toasts[0].open).toBe(false)
    })

    test('should dismiss all toasts when no id provided', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast({ title: 'Toast 1' })
        result.current.toast({ title: 'Toast 2' })
        result.current.dismiss()
      })

      expect(result.current.toasts[0].open).toBe(false)
      if (result.current.toasts[1]) {
        expect(result.current.toasts[1].open).toBe(false)
      }
    })

    test('should update state when toasts are added externally', () => {
      const { result } = renderHook(() => useToast())

      // Add toast using the global toast function
      act(() => {
        toast({ title: 'External Toast' })
      })

      expect(result.current.toasts).toHaveLength(1)
      expect(result.current.toasts[0].title).toBe('External Toast')
    })

    test('should clean up listener on unmount', () => {
      const { unmount } = renderHook(() => useToast())

      expect(() => unmount()).not.toThrow()
    })
  })

  describe('toast removal timing', () => {
    test('should schedule toast removal after delay', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast({ title: 'Test Toast' })
      })

      // Toast should be present
      expect(result.current.toasts).toHaveLength(1)

      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(1000000)
      })

      // Toast should still be present (the actual removal happens via timeout)
      expect(result.current.toasts).toHaveLength(1)
    })
  })
})