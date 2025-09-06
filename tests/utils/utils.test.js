import functional from '../../src/utils/functional.js';

const {
  curry,
  compose,
  map,
  filter,
  reduce,
  pipe,
  identity,
  prop,
  path,
  pick,
  omit,
  merge,
  assoc,
  dissoc,
  isNil,
  isEmpty,
  not,
  when,
  unless,
  tap,
  tryCatch,
  memoize,
  debounce,
  throttle,
  all,
  any,
  find,
  findIndex,
  head,
  tail,
  last,
  init,
  take,
  drop,
  sort,
  reverse,
  uniq,
  flatten,
  groupBy,
  countBy,
  partition,
  shuffleArray
} = functional;

describe('Functional Utility Tests', () => {
  describe('curry', () => {
    it('should curry a function with multiple arguments', () => {
      const add = (a, b, c) => a + b + c;
      const curriedAdd = curry(add);
      
      expect(curriedAdd(1)(2)(3)).toBe(6);
      expect(curriedAdd(1, 2)(3)).toBe(6);
      expect(curriedAdd(1)(2, 3)).toBe(6);
      expect(curriedAdd(1, 2, 3)).toBe(6);
    });

    it('should handle single argument functions', () => {
      const increment = x => x + 1;
      const curriedIncrement = curry(increment);
      
      expect(curriedIncrement(5)).toBe(6);
    });

    it('should handle zero argument functions', () => {
      const getValue = () => 42;
      const curriedGetValue = curry(getValue);
      
      expect(curriedGetValue()).toBe(42);
    });
  });

  describe('compose', () => {
    it('should compose functions from right to left', () => {
      const add1 = x => x + 1;
      const multiply2 = x => x * 2;
      const subtract3 = x => x - 3;
      
      const composed = compose(subtract3, multiply2, add1);
      expect(composed(5)).toBe(9); // ((5 + 1) * 2) - 3 = 9
    });

    it('should handle single function composition', () => {
      const increment = x => x + 1;
      const composed = compose(increment);
      
      expect(composed(5)).toBe(6);
    });

    it('should handle empty composition', () => {
      const composed = compose();
      expect(composed(5)).toBe(5);
    });
  });

  describe('pipe', () => {
    it('should compose functions from left to right', () => {
      const add1 = x => x + 1;
      const multiply2 = x => x * 2;
      const subtract3 = x => x - 3;
      
      const piped = pipe(add1, multiply2, subtract3);
      expect(piped(5)).toBe(9); // ((5 + 1) * 2) - 3 = 9
    });
  });

  describe('map', () => {
    it('should apply function to each array element', () => {
      const double = x => x * 2;
      const mapped = map(double)([1, 2, 3]);
      
      expect(mapped).toEqual([2, 4, 6]);
    });

    it('should handle empty arrays', () => {
      const double = x => x * 2;
      const mapped = map(double)([]);
      
      expect(mapped).toEqual([]);
    });

    it('should handle single element arrays', () => {
      const double = x => x * 2;
      const mapped = map(double)([5]);
      
      expect(mapped).toEqual([10]);
    });
  });

  describe('filter', () => {
    it('should filter array based on predicate', () => {
      const isEven = x => x % 2 === 0;
      const filtered = filter(isEven)([1, 2, 3, 4, 5, 6]);
      
      expect(filtered).toEqual([2, 4, 6]);
    });

    it('should handle empty arrays', () => {
      const isEven = x => x % 2 === 0;
      const filtered = filter(isEven)([]);
      
      expect(filtered).toEqual([]);
    });

    it('should handle arrays with no matching elements', () => {
      const isEven = x => x % 2 === 0;
      const filtered = filter(isEven)([1, 3, 5]);
      
      expect(filtered).toEqual([]);
    });
  });

  describe('reduce', () => {
    it('should reduce array to single value', () => {
      const sum = (acc, x) => acc + x;
      const reduced = reduce(sum, 0)([1, 2, 3, 4, 5]);
      
      expect(reduced).toBe(15);
    });

    it('should handle empty arrays with initial value', () => {
      const sum = (acc, x) => acc + x;
      const reduced = reduce(sum, 10)([]);
      
      expect(reduced).toBe(10);
    });

    it('should handle single element arrays', () => {
      const sum = (acc, x) => acc + x;
      const reduced = reduce(sum, 0)([5]);
      
      expect(reduced).toBe(5);
    });
  });

  describe('identity', () => {
    it('should return the same value', () => {
      expect(identity(5)).toBe(5);
      expect(identity('hello')).toBe('hello');
      expect(identity(null)).toBe(null);
      expect(identity(undefined)).toBe(undefined);
    });
  });

  describe('prop', () => {
    it('should get property from object', () => {
      const obj = { name: 'John', age: 30 };
      const getName = prop('name');
      
      expect(getName(obj)).toBe('John');
    });

    it('should return undefined for non-existent properties', () => {
      const obj = { name: 'John' };
      const getAge = prop('age');
      
      expect(getAge(obj)).toBeUndefined();
    });

    it('should handle nested objects', () => {
      const obj = { user: { name: 'John' } };
      const getUser = prop('user');
      
      expect(getUser(obj)).toEqual({ name: 'John' });
    });
  });

  describe('path', () => {
    it('should get nested property from object', () => {
      const obj = { user: { profile: { name: 'John' } } };
      const getName = path(['user', 'profile', 'name']);
      
      expect(getName(obj)).toBe('John');
    });

    it('should return undefined for non-existent nested paths', () => {
      const obj = { user: { profile: {} } };
      const getName = path(['user', 'profile', 'name']);
      
      expect(getName(obj)).toBeUndefined();
    });

    it('should handle empty path array', () => {
      const obj = { name: 'John' };
      const getObj = path([]);
      
      expect(getObj(obj)).toBe(obj);
    });
  });

  describe('pick', () => {
    it('should pick specified properties from object', () => {
      const obj = { name: 'John', age: 30, city: 'NY' };
      const picked = pick(['name', 'age'])(obj);
      
      expect(picked).toEqual({ name: 'John', age: 30 });
    });

    it('should handle non-existent properties', () => {
      const obj = { name: 'John', age: 30 };
      const picked = pick(['name', 'city'])(obj);
      
      expect(picked).toEqual({ name: 'John' });
    });

    it('should handle empty keys array', () => {
      const obj = { name: 'John', age: 30 };
      const picked = pick([])(obj);
      
      expect(picked).toEqual({});
    });
  });

  describe('omit', () => {
    it('should omit specified properties from object', () => {
      const obj = { name: 'John', age: 30, city: 'NY' };
      const omitted = omit(['age'])(obj);
      
      expect(omitted).toEqual({ name: 'John', city: 'NY' });
    });

    it('should handle non-existent properties', () => {
      const obj = { name: 'John', age: 30 };
      const omitted = omit(['city'])(obj);
      
      expect(omitted).toEqual({ name: 'John', age: 30 });
    });

    it('should handle empty keys array', () => {
      const obj = { name: 'John', age: 30 };
      const omitted = omit([])(obj);
      
      expect(omitted).toEqual({ name: 'John', age: 30 });
    });
  });

  describe('merge', () => {
    it('should merge two objects', () => {
      const obj1 = { name: 'John', age: 30 };
      const obj2 = { age: 31, city: 'NY' };
      const merged = merge(obj1)(obj2);
      
      expect(merged).toEqual({ name: 'John', age: 31, city: 'NY' });
    });

    it('should overwrite properties from second object', () => {
      const obj1 = { name: 'John', age: 30 };
      const obj2 = { age: 31 };
      const merged = merge(obj1)(obj2);
      
      expect(merged.age).toBe(31);
    });

    it('should handle empty objects', () => {
      const obj1 = {};
      const obj2 = { name: 'John' };
      const merged = merge(obj1)(obj2);
      
      expect(merged).toEqual({ name: 'John' });
    });
  });

  describe('assoc', () => {
    it('should associate property with object', () => {
      const obj = { name: 'John' };
      const withAge = assoc('age')(30);
      
      expect(withAge(obj)).toEqual({ name: 'John', age: 30 });
    });

    it('should overwrite existing properties', () => {
      const obj = { name: 'John', age: 30 };
      const withAge = assoc('age')(31);
      
      expect(withAge(obj)).toEqual({ name: 'John', age: 31 });
    });
  });

  describe('dissoc', () => {
    it('should dissociate property from object', () => {
      const obj = { name: 'John', age: 30 };
      const withoutAge = dissoc('age')(obj);
      
      expect(withoutAge).toEqual({ name: 'John' });
    });

    it('should handle non-existent properties', () => {
      const obj = { name: 'John' };
      const withoutAge = dissoc('age')(obj);
      
      expect(withoutAge).toEqual({ name: 'John' });
    });
  });

  describe('isNil', () => {
    it('should return true for null and undefined', () => {
      expect(isNil(null)).toBe(true);
      expect(isNil(undefined)).toBe(true);
    });

    it('should return false for other values', () => {
      expect(isNil(0)).toBe(false);
      expect(isNil('')).toBe(false);
      expect(isNil(false)).toBe(false);
      expect(isNil({})).toBe(false);
      expect(isNil([])).toBe(false);
    });
  });

  describe('isEmpty', () => {
    it('should return true for null and undefined', () => {
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
    });

    it('should return true for empty strings and arrays', () => {
      expect(isEmpty('')).toBe(true);
      expect(isEmpty([])).toBe(true);
    });

    it('should return true for empty objects', () => {
      expect(isEmpty({})).toBe(true);
    });

    it('should return false for non-empty values', () => {
      expect(isEmpty('hello')).toBe(false);
      expect(isEmpty([1, 2, 3])).toBe(false);
      expect(isEmpty({ name: 'John' })).toBe(false);
      expect(isEmpty(0)).toBe(false);
      expect(isEmpty(false)).toBe(false);
    });
  });

  describe('not', () => {
    it('should negate predicate function', () => {
      const isEven = x => x % 2 === 0;
      const isOdd = not(isEven);
      
      expect(isOdd(3)).toBe(true);
      expect(isOdd(2)).toBe(false);
    });
  });

  describe('when', () => {
    it('should apply function when predicate is true', () => {
      const double = x => x * 2;
      const whenEven = when(x => x % 2 === 0)(double);
      
      expect(whenEven(4)).toBe(8);
    });

    it('should return original value when predicate is false', () => {
      const double = x => x * 2;
      const whenEven = when(x => x % 2 === 0)(double);
      
      expect(whenEven(3)).toBe(3);
    });
  });

  describe('unless', () => {
    it('should apply function when predicate is false', () => {
      const double = x => x * 2;
      const unlessEven = unless(x => x % 2 === 0)(double);
      
      expect(unlessEven(3)).toBe(6);
    });

    it('should return original value when predicate is true', () => {
      const double = x => x * 2;
      const unlessEven = unless(x => x % 2 === 0)(double);
      
      expect(unlessEven(4)).toBe(4);
    });
  });

  describe('tap', () => {
    it('should execute function and return original value', () => {
      const logger = jest.fn();
      const tapped = tap(logger)(5);
      
      expect(logger).toHaveBeenCalledWith(5);
      expect(tapped).toBe(5);
    });
  });

  describe('tryCatch', () => {
    it('should return tryFn result when successful', () => {
      const tryFn = x => x * 2;
      const catchFn = jest.fn();
      const tryCatchFn = tryCatch(tryFn)(catchFn);
      
      expect(tryCatchFn(5)).toBe(10);
      expect(catchFn).not.toHaveBeenCalled();
    });

    it('should return catchFn result when tryFn throws', () => {
      const tryFn = () => { throw new Error('Test error'); };
      const catchFn = jest.fn().mockReturnValue('fallback');
      const tryCatchFn = tryCatch(tryFn)(catchFn);
      
      expect(tryCatchFn(5)).toBe('fallback');
      expect(catchFn).toHaveBeenCalledWith(expect.any(Error), 5);
    });
  });

  describe('memoize', () => {
    it('should memoize function results', () => {
      const expensiveFn = jest.fn(x => x * 2);
      const memoizedFn = memoize(expensiveFn);
      
      expect(memoizedFn(5)).toBe(10);
      expect(memoizedFn(5)).toBe(10);
      expect(expensiveFn).toHaveBeenCalledTimes(1);
    });

    it('should handle different arguments separately', () => {
      const expensiveFn = jest.fn(x => x * 2);
      const memoizedFn = memoize(expensiveFn);
      
      expect(memoizedFn(5)).toBe(10);
      expect(memoizedFn(3)).toBe(6);
      expect(expensiveFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('head', () => {
    it('should return first element of array', () => {
      expect(head([1, 2, 3])).toBe(1);
    });

    it('should return undefined for empty arrays', () => {
      expect(head([])).toBeUndefined();
    });
  });

  describe('tail', () => {
    it('should return all elements except first', () => {
      expect(tail([1, 2, 3, 4])).toEqual([2, 3, 4]);
    });

    it('should return empty array for single element arrays', () => {
      expect(tail([1])).toEqual([]);
    });

    it('should return empty array for empty arrays', () => {
      expect(tail([])).toEqual([]);
    });
  });

  describe('last', () => {
    it('should return last element of array', () => {
      expect(last([1, 2, 3])).toBe(3);
    });

    it('should return undefined for empty arrays', () => {
      expect(last([])).toBeUndefined();
    });
  });

  describe('init', () => {
    it('should return all elements except last', () => {
      expect(init([1, 2, 3, 4])).toEqual([1, 2, 3]);
    });

    it('should return empty array for single element arrays', () => {
      expect(init([1])).toEqual([]);
    });

    it('should return empty array for empty arrays', () => {
      expect(init([])).toEqual([]);
    });
  });

  describe('take', () => {
    it('should take first n elements', () => {
      expect(take(2)([1, 2, 3, 4, 5])).toEqual([1, 2]);
    });

    it('should handle n larger than array length', () => {
      expect(take(10)([1, 2, 3])).toEqual([1, 2, 3]);
    });

    it('should handle n = 0', () => {
      expect(take(0)([1, 2, 3])).toEqual([]);
    });
  });

  describe('drop', () => {
    it('should drop first n elements', () => {
      expect(drop(2)([1, 2, 3, 4, 5])).toEqual([3, 4, 5]);
    });

    it('should handle n larger than array length', () => {
      expect(drop(10)([1, 2, 3])).toEqual([]);
    });

    it('should handle n = 0', () => {
      expect(drop(0)([1, 2, 3])).toEqual([1, 2, 3]);
    });
  });

  describe('sort', () => {
    it('should sort array with comparator', () => {
      const comparator = (a, b) => a - b;
      const sorted = sort(comparator)([3, 1, 4, 2]);
      
      expect(sorted).toEqual([1, 2, 3, 4]);
    });

    it('should not mutate original array', () => {
      const original = [3, 1, 4, 2];
      const sorted = sort((a, b) => a - b)(original);
      
      expect(original).toEqual([3, 1, 4, 2]);
      expect(sorted).toEqual([1, 2, 3, 4]);
    });
  });

  describe('reverse', () => {
    it('should reverse array', () => {
      expect(reverse([1, 2, 3, 4])).toEqual([4, 3, 2, 1]);
    });

    it('should not mutate original array', () => {
      const original = [1, 2, 3, 4];
      const reversed = reverse(original);
      
      expect(original).toEqual([1, 2, 3, 4]);
      expect(reversed).toEqual([4, 3, 2, 1]);
    });
  });

  describe('uniq', () => {
    it('should remove duplicates from array', () => {
      expect(uniq([1, 2, 2, 3, 3, 3, 4])).toEqual([1, 2, 3, 4]);
    });

    it('should handle empty arrays', () => {
      expect(uniq([])).toEqual([]);
    });

    it('should handle arrays with no duplicates', () => {
      expect(uniq([1, 2, 3])).toEqual([1, 2, 3]);
    });
  });

  describe('flatten', () => {
    it('should flatten nested arrays', () => {
      expect(flatten([1, [2, [3, 4], 5]])).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle empty arrays', () => {
      expect(flatten([])).toEqual([]);
    });

    it('should handle already flat arrays', () => {
      expect(flatten([1, 2, 3])).toEqual([1, 2, 3]);
    });
  });

  describe('groupBy', () => {
    it('should group array by key function', () => {
      const users = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
        { name: 'Bob', age: 30 }
      ];
      const grouped = groupBy(user => user.age)(users);
      
      expect(grouped).toEqual({
        30: [
          { name: 'John', age: 30 },
          { name: 'Bob', age: 30 }
        ],
        25: [
          { name: 'Jane', age: 25 }
        ]
      });
    });

    it('should handle empty arrays', () => {
      expect(groupBy(x => x)([])).toEqual({});
    });
  });

  describe('countBy', () => {
    it('should count elements by key function', () => {
      const users = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
        { name: 'Bob', age: 30 }
      ];
      const counted = countBy(user => user.age)(users);
      
      expect(counted).toEqual({
        30: 2,
        25: 1
      });
    });

    it('should handle empty arrays', () => {
      expect(countBy(x => x)([])).toEqual({});
    });
  });

  describe('partition', () => {
    it('should partition array based on predicate', () => {
      const isEven = x => x % 2 === 0;
      const [even, odd] = partition(isEven)([1, 2, 3, 4, 5, 6]);
      
      expect(even).toEqual([2, 4, 6]);
      expect(odd).toEqual([1, 3, 5]);
    });

    it('should handle empty arrays', () => {
      const [even, odd] = partition(x => x % 2 === 0)([]);
      
      expect(even).toEqual([]);
      expect(odd).toEqual([]);
    });
  });

  describe('shuffleArray', () => {
    it('should shuffle array (check that it changes order)', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(original);
      
      expect(shuffled).toHaveLength(5);
      expect(shuffled).toContain(1);
      expect(shuffled).toContain(2);
      expect(shuffled).toContain(3);
      expect(shuffled).toContain(4);
      expect(shuffled).toContain(5);
      
      // Check that order changed (very low probability of being the same)
      const isSameOrder = shuffled.every((val, index) => val === original[index]);
      expect(isSameOrder).toBe(false);
    });

    it('should not mutate original array', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(original);
      
      expect(original).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle empty arrays', () => {
      expect(shuffleArray([])).toEqual([]);
    });

    it('should handle single element arrays', () => {
      expect(shuffleArray([1])).toEqual([1]);
    });
  });

  describe('all', () => {
    it('should return true if all elements satisfy predicate', () => {
      const isPositive = x => x > 0;
      expect(all(isPositive)([1, 2, 3])).toBe(true);
    });

    it('should return false if any element fails predicate', () => {
      const isPositive = x => x > 0;
      expect(all(isPositive)([1, -2, 3])).toBe(false);
    });
  });

  describe('any', () => {
    it('should return true if any element satisfies predicate', () => {
      const isPositive = x => x > 0;
      expect(any(isPositive)([-1, 2, -3])).toBe(true);
    });

    it('should return false if no element satisfies predicate', () => {
      const isPositive = x => x > 0;
      expect(any(isPositive)([-1, -2, -3])).toBe(false);
    });
  });

  describe('find', () => {
    it('should find first element that satisfies predicate', () => {
      const isEven = x => x % 2 === 0;
      expect(find(isEven)([1, 2, 3, 4])).toBe(2);
    });

    it('should return undefined if no element satisfies predicate', () => {
      const isEven = x => x % 2 === 0;
      expect(find(isEven)([1, 3, 5])).toBeUndefined();
    });
  });

  describe('findIndex', () => {
    it('should find index of first element that satisfies predicate', () => {
      const isEven = x => x % 2 === 0;
      expect(findIndex(isEven)([1, 2, 3, 4])).toBe(1);
    });

    it('should return -1 if no element satisfies predicate', () => {
      const isEven = x => x % 2 === 0;
      expect(findIndex(isEven)([1, 3, 5])).toBe(-1);
    });
  });
});