import { cn } from './utils'

describe('cn utility function', () => {
  test('should merge class names correctly', () => {
    const result = cn('class1', 'class2')
    expect(result).toBe('class1 class2')
  })

  test('should handle conditional class names', () => {
    const condition = true
    const result = cn('base-class', condition && 'conditional-class')
    expect(result).toBe('base-class conditional-class')
  })

  test('should handle false conditional class names', () => {
    const condition = false
    const result = cn('base-class', condition && 'conditional-class')
    expect(result).toBe('base-class')
  })

  test('should handle empty inputs', () => {
    const result = cn()
    expect(result).toBe('')
  })

  test('should handle undefined and null inputs', () => {
    const result = cn('class1', undefined, null, 'class2')
    expect(result).toBe('class1 class2')
  })

  test('should handle object inputs', () => {
    const result = cn('base-class', { 'active-class': true, 'inactive-class': false })
    expect(result).toBe('base-class active-class')
  })

  test('should handle array inputs', () => {
    const result = cn('base-class', ['array-class1', 'array-class2'])
    expect(result).toBe('base-class array-class1 array-class2')
  })
})