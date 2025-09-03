import { Checkbox } from './checkbox'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock @radix-ui/react-checkbox
jest.mock('@radix-ui/react-checkbox', () => ({
  Root: ({ children, className, checked, onCheckedChange, ...props }: any) => (
    <button
      role="checkbox"
      aria-checked={checked}
      className={className}
      data-slot="checkbox"
      onClick={() => onCheckedChange?.(!checked)}
      {...props}
    >
      {children}
    </button>
  ),
  Indicator: ({ children, className, ...props }: any) => (
    <span className={className} data-slot="checkbox-indicator" {...props}>
      {children}
    </span>
  ),
}))

// Mock lucide-react CheckIcon
jest.mock('lucide-react', () => ({
  CheckIcon: ({ className, ...props }: any) => (
    <svg className={className} {...props}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
}))

describe('Checkbox component', () => {
  test('should render checkbox with default classes', () => {
    render(<Checkbox />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeInTheDocument()
    expect(checkbox).toHaveAttribute('data-slot', 'checkbox')
    expect(checkbox).toHaveClass(
      'peer',
      'border-input',
      'data-[state=checked]:bg-primary',
      'data-[state=checked]:text-primary-foreground',
      'size-4',
      'shrink-0',
      'rounded-[4px]',
      'border',
      'shadow-xs',
      'transition-shadow',
      'outline-none'
    )
  })

  test('should render checkbox with custom className', () => {
    render(<Checkbox className="custom-class" />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveClass('custom-class')
  })

  test('should render checkbox indicator', () => {
    render(<Checkbox />)

    const checkbox = screen.getByRole('checkbox')
    const indicator = checkbox.querySelector('[data-slot="checkbox-indicator"]')
    expect(indicator).toBeInTheDocument()
    expect(indicator).toHaveClass('flex', 'items-center', 'justify-center', 'text-current', 'transition-none')
  })

  test('should render check icon', () => {
    render(<Checkbox checked={true} />)

    const checkbox = screen.getByRole('checkbox')
    const checkIcon = checkbox.querySelector('svg')
    expect(checkIcon).toBeInTheDocument()
    expect(checkIcon).toHaveClass('size-3.5')
  })

  test('should handle checked state', () => {
    render(<Checkbox checked={true} />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveAttribute('aria-checked', 'true')
  })

  test('should handle unchecked state', () => {
    render(<Checkbox checked={false} />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveAttribute('aria-checked', 'false')
  })

  test('should handle click events', async () => {
    const handleChange = jest.fn()
    const user = userEvent.setup()

    render(<Checkbox onCheckedChange={handleChange} />)

    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)

    expect(handleChange).toHaveBeenCalledWith(true)
  })

  test('should be disabled when disabled prop is true', () => {
    render(<Checkbox disabled />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeDisabled()
    expect(checkbox).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
  })

  test('should pass additional props to checkbox element', () => {
    render(<Checkbox data-testid="test-checkbox" aria-label="Test checkbox" />)

    const checkbox = screen.getByTestId('test-checkbox')
    expect(checkbox).toHaveAttribute('aria-label', 'Test checkbox')
  })

  test('should have proper styling for focus states', () => {
    render(<Checkbox />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveClass(
      'focus-visible:border-ring',
      'focus-visible:ring-ring/50',
      'focus-visible:ring-[3px]'
    )
  })

  test('should have proper styling for invalid state', () => {
    render(<Checkbox aria-invalid="true" />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveClass(
      'aria-invalid:ring-destructive/20',
      'dark:aria-invalid:ring-destructive/40',
      'aria-invalid:border-destructive'
    )
  })

  test('should have proper styling for dark mode', () => {
    render(<Checkbox />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveClass('dark:bg-input/30', 'dark:data-[state=checked]:bg-primary')
  })
})