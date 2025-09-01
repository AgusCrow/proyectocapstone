// Test simple para verificar que Jest funciona
import { compose, prop, path, identity } from 'ramda';

describe('Simple Test', () => {
  it('debería pasar un test básico', () => {
    expect(1 + 1).toBe(2);
  });

  it('debería manejar strings correctamente', () => {
    expect('hello' + ' world').toBe('hello world');
  });

  it('debería manejar arrays correctamente', () => {
    const arr = [1, 2, 3];
    expect(arr.length).toBe(3);
    expect(arr[0]).toBe(1);
  });

  it('debería manejar objetos correctamente', () => {
    const obj = { name: 'test', value: 42 };
    expect(obj.name).toBe('test');
    expect(obj.value).toBe(42);
  });

  it('debería manejar funciones correctamente', () => {
    const add = (a, b) => a + b;
    expect(add(2, 3)).toBe(5);
  });

  it('debería manejar programación funcional con Ramda', () => {
    const data = { user: { name: 'John', age: 30 } };
    const getName = compose(prop('name'), prop('user'));
    expect(getName(data)).toBe('John');
  });

  it('debería manejar async/await', async () => {
    const asyncFunction = async () => {
      return new Promise(resolve => {
        setTimeout(() => resolve('success'), 10);
      });
    };
    
    const result = await asyncFunction();
    expect(result).toBe('success');
  });

  it('debería manejar promesas', () => {
    const promise = Promise.resolve('resolved');
    return promise.then(result => {
      expect(result).toBe('resolved');
    });
  });

  it('debería manejar errores', () => {
    expect(() => {
      throw new Error('test error');
    }).toThrow('test error');
  });

  it('debería manejar mocks', () => {
    // Solo usar jest.fn() si jest está disponible
    if (typeof jest !== 'undefined') {
      const mockFn = jest.fn().mockReturnValue('mocked');
      expect(mockFn()).toBe('mocked');
      expect(mockFn).toHaveBeenCalled();
    } else {
      // Fallback para cuando jest no está disponible
      const mockFn = () => 'mocked';
      expect(mockFn()).toBe('mocked');
    }
  });
}); 