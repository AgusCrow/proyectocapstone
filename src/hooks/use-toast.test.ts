import { renderHook, act } from '@testing-library/react';
import { useToast, toast, reducer } from '@/hooks/use-toast';

// Mock setTimeout and clearTimeout
jest.useFakeTimers();

describe('useToast Hook and Reducer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    
    // Mock global dispatch function
    (global as any).dispatch = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
    delete (global as any).dispatch;
  });

  describe('reducer', () => {
    it('should handle ADD_TOAST action', () => {
      const initialState = { toasts: [] };
      const action = {
        type: 'ADD_TOAST',
        toast: {
          id: '1',
          title: 'Test Toast',
          description: 'Test Description',
          open: true,
        },
      };

      const newState = reducer(initialState, action);

      expect(newState.toasts).toHaveLength(1);
      expect(newState.toasts[0]).toEqual(action.toast);
    });

    it('should handle UPDATE_TOAST action', () => {
      const initialState = {
        toasts: [
          { id: '1', title: 'Original Title', description: 'Original Description' },
        ],
      };
      const action = {
        type: 'UPDATE_TOAST',
        toast: { id: '1', title: 'Updated Title' },
      };

      const newState = reducer(initialState, action);

      expect(newState.toasts[0].title).toBe('Updated Title');
      expect(newState.toasts[0].description).toBe('Original Description');
    });

    it('should handle DISMISS_TOAST action', () => {
      const initialState = {
        toasts: [
          { id: '1', title: 'Toast 1', open: true },
          { id: '2', title: 'Toast 2', open: true },
        ],
      };
      const action = {
        type: 'DISMISS_TOAST',
        toastId: '1',
      };

      const newState = reducer(initialState, action);

      expect(newState.toasts[0].open).toBe(false);
      expect(newState.toasts[1].open).toBe(true);
    });

    it('should handle REMOVE_TOAST action', () => {
      const initialState = {
        toasts: [
          { id: '1', title: 'Toast 1', open: true },
          { id: '2', title: 'Toast 2', open: true },
        ],
      };
      const action = {
        type: 'REMOVE_TOAST',
        toastId: '1',
      };

      const newState = reducer(initialState, action);

      expect(newState.toasts).toHaveLength(1);
      expect(newState.toasts[0].id).toBe('2');
    });
  });

  describe('toast function', () => {
    it('should return an object with id, dismiss, and update methods', () => {
      const result = toast({ title: 'Test Toast' });

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('dismiss');
      expect(result).toHaveProperty('update');
      expect(typeof result.dismiss).toBe('function');
      expect(typeof result.update).toBe('function');
    });

    it('should generate unique IDs for different toasts', () => {
      const toast1 = toast({ title: 'Toast 1' });
      const toast2 = toast({ title: 'Toast 2' });

      expect(toast1.id).not.toBe(toast2.id);
    });
  });

  describe('useToast hook', () => {
    it('should return current state and toast function', () => {
      const { result } = renderHook(() => useToast());

      expect(result.current).toHaveProperty('toasts');
      expect(result.current).toHaveProperty('toast');
      expect(result.current).toHaveProperty('dismiss');
      expect(Array.isArray(result.current.toasts)).toBe(true);
      expect(typeof result.current.toast).toBe('function');
      expect(typeof result.current.dismiss).toBe('function');
    });

    it('should add toast when toast function is called', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({ title: 'Test Toast' });
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].title).toBe('Test Toast');
    });
  });
});