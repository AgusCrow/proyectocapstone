import { Button, buttonVariants } from './button'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock @radix-ui/react-slot
jest.mock('@radix-ui/react-slot', () => ({
  Slot: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}))

describe('Button component', () => {
  test('should render button with default variant and size', () => {
    render(<Button>Click me</Button>)

    const button = screen.getByRole('button', { name: 'Click me' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('bg-primary', 'text-primary-foreground', 'h-9', 'px-4', 'py-2')
  })

  test('should render button with destructive variant', () => {
    render(<Button variant="destructive">Delete</Button>)

    const button = screen.getByRole('button', { name: 'Delete' })
    expect(button).toHaveClass('bg-destructive', 'text-white')
  })

  test('should render button with outline variant', () => {
    render(<Button variant="outline">Outline</Button>)

    const button = screen.getByRole('button', { name: 'Outline' })
    expect(button).toHaveClass('border', 'bg-background')
  })

  test('should render button with secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>)

    const button = screen.getByRole('button', { name: 'Secondary' })
    expect(button).toHaveClass('bg-secondary', 'text-secondary-foreground')
  })

  test('should render button with ghost variant', () => {
    render(<Button variant="ghost">Ghost</Button>)

    const button = screen.getByRole('button', { name: 'Ghost' })
    expect(button).toHaveClass('hover:bg-accent', 'hover:text-accent-foreground')
  })

  test('should render button with link variant', () => {
    render(<Button variant="link">Link</Button>)

    const button = screen.getByRole('button', { name: 'Link' })
    expect(button).toHaveClass('text-primary', 'underline-offset-4', 'hover:underline')
  })

  test('should render button with small size', () => {
    render(<Button size="sm">Small</Button>)

    const button = screen.getByRole('button', { name: 'Small' })
    expect(button).toHaveClass('h-8', 'rounded-md', 'gap-1.5', 'px-3')
  })

  test('should render button with large size', () => {
    render(<Button size="lg">Large</Button>)

    const button = screen.getByRole('button', { name: 'Large' })
    expect(button).toHaveClass('h-10', 'rounded-md', 'px-6')
  })

  test('should render button with icon size', () => {
    render(<Button size="icon">Icon</Button>)

    const button = screen.getByRole('button', { name: 'Icon' })
    expect(button).toHaveClass('size-9')
  })

  test('should render button with custom className', () => {
    render(<Button className="custom-class">Custom</Button>)

    const button = screen.getByRole('button', { name: 'Custom' })
    expect(button).toHaveClass('custom-class')
  })

  test('should render button as child when asChild is true', () => {
    render(<Button asChild>Child Button</Button>)

    const buttonContainer = screen.getByText('Child Button')
    expect(buttonContainer).toBeInTheDocument()
    expect(buttonContainer).toHaveAttribute('data-slot', 'button')
    expect(buttonContainer.tagName).toBe('DIV')
  })

  test('should handle click events', async () => {
    const handleClick = jest.fn()
    const user = userEvent.setup()

    render(<Button onClick={handleClick}>Click me</Button>)

    const button = screen.getByRole('button', { name: 'Click me' })
    await user.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)

    const button = screen.getByRole('button', { name: 'Disabled' })
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50')
  })

  test('should pass additional props to button element', () => {
    render(<Button data-testid="test-button" aria-label="Test button">Test</Button>)

    const button = screen.getByTestId('test-button')
    expect(button).toHaveAttribute('aria-label', 'Test button')
  })
})

describe('buttonVariants utility', () => {
  test('should return correct classes for default variant', () => {
    const classes = buttonVariants()
    expect(classes).toContain('bg-primary')
    expect(classes).toContain('text-primary-foreground')
    expect(classes).toContain('h-9')
    expect(classes).toContain('px-4')
  })

  test('should return correct classes for custom variant and size', () => {
    const classes = buttonVariants({ variant: 'destructive', size: 'lg' })
    expect(classes).toContain('bg-destructive')
    expect(classes).toContain('text-white')
    expect(classes).toContain('h-10')
    expect(classes).toContain('px-6')
  })

  test('should merge custom className with variant classes', () => {
    const classes = buttonVariants({ className: 'custom-class' })
    expect(classes).toContain('custom-class')
    expect(classes).toContain('bg-primary')
  })
})