import { cn } from './utils'

describe('cn utility function', () => {
  test('should combine multiple class names', () => {
    const result = cn('class1', 'class2', 'class3')
    expect(result).toBe('class1 class2 class3')
  })

  test('should handle conditional classes with clsx', () => {
    const condition = true
    const result = cn('base-class', condition && 'conditional-class')
    expect(result).toBe('base-class conditional-class')
  })

  test('should handle false conditional classes', () => {
    const condition = false
    const result = cn('base-class', condition && 'conditional-class')
    expect(result).toBe('base-class')
  })

  test('should merge tailwind classes correctly with twMerge', () => {
    const result = cn('px-2 py-1', 'px-4')
    expect(result).toBe('py-1 px-4')
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

  test('should handle complex tailwind merging', () => {
    const result = cn('bg-red-500 hover:bg-red-600', 'bg-blue-500 hover:bg-blue-600')
    // The order might vary depending on twMerge implementation
    expect(result).toContain('bg-blue-500')
    expect(result).toContain('hover:bg-blue-600')
    expect(result).not.toContain('bg-red-500')
    expect(result).not.toContain('hover:bg-red-600')
  })

  test('should handle responsive classes', () => {
    const result = cn('p-4', 'md:p-6', 'lg:p-8')
    expect(result).toBe('p-4 md:p-6 lg:p-8')
  })
})