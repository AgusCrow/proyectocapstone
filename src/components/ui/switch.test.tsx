import { Switch } from './switch'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock @radix-ui/react-switch
jest.mock('@radix-ui/react-switch', () => ({
  Root: ({ children, className, checked, onCheckedChange, ...props }: any) => (
    <button
      role="switch"
      aria-checked={checked}
      className={className}
      data-slot="switch"
      onClick={() => onCheckedChange?.(!checked)}
      {...props}
    >
      {children}
    </button>
  ),
  Thumb: ({ className, ...props }: any) => (
    <span className={className} data-slot="switch-thumb" {...props} />
  ),
}))

describe('Switch component', () => {
  test('should render switch with default classes', () => {
    render(<Switch />)

    const switchElement = screen.getByRole('switch')
    expect(switchElement).toBeInTheDocument()
    expect(switchElement).toHaveAttribute('data-slot', 'switch')
    expect(switchElement).toHaveClass(
      'peer',
      'data-[state=checked]:bg-primary',
      'data-[state=unchecked]:bg-input',
      'inline-flex',
      'h-[1.15rem]',
      'w-8',
      'shrink-0',
      'items-center',
      'rounded-full',
      'border',
      'border-transparent',
      'shadow-xs',
      'transition-all',
      'outline-none'
    )
  })

  test('should render switch with custom className', () => {
    render(<Switch className="custom-class" />)

    const switchElement = screen.getByRole('switch')
    expect(switchElement).toHaveClass('custom-class')
  })

  test('should render switch thumb', () => {
    render(<Switch />)

    const switchElement = screen.getByRole('switch')
    const thumb = switchElement.querySelector('[data-slot="switch-thumb"]')
    expect(thumb).toBeInTheDocument()
    expect(thumb).toHaveClass(
      'bg-background',
      'pointer-events-none',
      'block',
      'size-4',
      'rounded-full',
      'ring-0',
      'transition-transform',
      'data-[state=unchecked]:translate-x-0'
    )
  })

  test('should handle checked state', () => {
    render(<Switch checked={true} />)

    const switchElement = screen.getByRole('switch')
    expect(switchElement).toHaveAttribute('aria-checked', 'true')
  })

  test('should handle unchecked state', () => {
    render(<Switch checked={false} />)

    const switchElement = screen.getByRole('switch')
    expect(switchElement).toHaveAttribute('aria-checked', 'false')
  })

  test('should handle click events', async () => {
    const handleChange = jest.fn()
    const user = userEvent.setup()

    render(<Switch onCheckedChange={handleChange} />)

    const switchElement = screen.getByRole('switch')
    await user.click(switchElement)

    expect(handleChange).toHaveBeenCalledWith(true)
  })

  test('should be disabled when disabled prop is true', () => {
    render(<Switch disabled />)

    const switchElement = screen.getByRole('switch')
    expect(switchElement).toBeDisabled()
    expect(switchElement).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
  })

  test('should pass additional props to switch element', () => {
    render(<Switch data-testid="test-switch" aria-label="Test switch" />)

    const switchElement = screen.getByTestId('test-switch')
    expect(switchElement).toHaveAttribute('aria-label', 'Test switch')
  })

  test('should have proper styling for focus states', () => {
    render(<Switch />)

    const switchElement = screen.getByRole('switch')
    expect(switchElement).toHaveClass(
      'focus-visible:border-ring',
      'focus-visible:ring-ring/50',
      'focus-visible:ring-[3px]'
    )
  })

  test('should have proper styling for dark mode', () => {
    render(<Switch />)

    const switchElement = screen.getByRole('switch')
    expect(switchElement).toHaveClass('dark:data-[state=unchecked]:bg-input/80')
  })

  test('should have proper thumb styling for dark mode', () => {
    render(<Switch />)

    const switchElement = screen.getByRole('switch')
    const thumb = switchElement.querySelector('[data-slot="switch-thumb"]')
    expect(thumb).toHaveClass(
      'dark:data-[state=unchecked]:bg-foreground',
      'dark:data-[state=checked]:bg-primary-foreground'
    )
  })
})