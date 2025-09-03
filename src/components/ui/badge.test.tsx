import { Badge, badgeVariants } from './badge'
import { render, screen } from '@testing-library/react'

// Mock @radix-ui/react-slot
jest.mock('@radix-ui/react-slot', () => ({
  Slot: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}))

describe('Badge component', () => {
  test('should render badge with default variant', () => {
    render(<Badge>Default Badge</Badge>)

    const badge = screen.getByText('Default Badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('border-transparent', 'bg-primary', 'text-primary-foreground')
    expect(badge.tagName).toBe('SPAN')
  })

  test('should render badge with secondary variant', () => {
    render(<Badge variant="secondary">Secondary Badge</Badge>)

    const badge = screen.getByText('Secondary Badge')
    expect(badge).toHaveClass('border-transparent', 'bg-secondary', 'text-secondary-foreground')
  })

  test('should render badge with destructive variant', () => {
    render(<Badge variant="destructive">Destructive Badge</Badge>)

    const badge = screen.getByText('Destructive Badge')
    expect(badge).toHaveClass('border-transparent', 'bg-destructive', 'text-white')
  })

  test('should render badge with outline variant', () => {
    render(<Badge variant="outline">Outline Badge</Badge>)

    const badge = screen.getByText('Outline Badge')
    expect(badge).toHaveClass('text-foreground')
  })

  test('should render badge with custom className', () => {
    render(<Badge className="custom-class">Custom Badge</Badge>)

    const badge = screen.getByText('Custom Badge')
    expect(badge).toHaveClass('custom-class')
  })

  test('should render badge as child when asChild is true', () => {
    render(<Badge asChild>Child Badge</Badge>)

    const badge = screen.getByText('Child Badge')
    expect(badge).toBeInTheDocument()
    expect(badge.tagName).toBe('DIV')
    expect(badge).toHaveAttribute('data-slot', 'badge')
  })

  test('should have correct data-slot attribute', () => {
    render(<Badge>Badge</Badge>)

    const badge = screen.getByText('Badge')
    expect(badge).toHaveAttribute('data-slot', 'badge')
  })

  test('should pass additional props to element', () => {
    render(<Badge data-testid="test-badge" aria-label="Test badge">Test</Badge>)

    const badge = screen.getByTestId('test-badge')
    expect(badge).toHaveAttribute('aria-label', 'Test badge')
  })
})

describe('badgeVariants utility', () => {
  test('should return correct classes for default variant', () => {
    const classes = badgeVariants()
    expect(classes).toContain('border-transparent')
    expect(classes).toContain('bg-primary')
    expect(classes).toContain('text-primary-foreground')
  })

  test('should return correct classes for secondary variant', () => {
    const classes = badgeVariants({ variant: 'secondary' })
    expect(classes).toContain('border-transparent')
    expect(classes).toContain('bg-secondary')
    expect(classes).toContain('text-secondary-foreground')
  })

  test('should return correct classes for destructive variant', () => {
    const classes = badgeVariants({ variant: 'destructive' })
    expect(classes).toContain('border-transparent')
    expect(classes).toContain('bg-destructive')
    expect(classes).toContain('text-white')
  })

  test('should return correct classes for outline variant', () => {
    const classes = badgeVariants({ variant: 'outline' })
    expect(classes).toContain('text-foreground')
  })

  test('should merge custom className with variant classes', () => {
    const classes = badgeVariants({ className: 'custom-class' })
    expect(classes).toContain('custom-class')
    expect(classes).toContain('bg-primary')
  })
})