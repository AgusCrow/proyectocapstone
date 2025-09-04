import { cn } from '@/lib/utils';

describe('cn utility function', () => {
  it('should merge classes correctly', () => {
    const result = cn('class1', 'class2', 'class3');
    expect(typeof result).toBe('string');
    expect(result).toContain('class1');
    expect(result).toContain('class2');
    expect(result).toContain('class3');
  });

  it('should handle empty arguments', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('should handle conditional classes', () => {
    const result = cn('base-class', true && 'active-class', false && 'inactive-class');
    expect(result).toContain('base-class');
    expect(result).toContain('active-class');
    expect(result).not.toContain('inactive-class');
  });

  it('should return a string', () => {
    const result = cn('btn', 'btn-primary');
    expect(typeof result).toBe('string');
  });
});