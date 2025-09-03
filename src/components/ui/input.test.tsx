import { Input } from './input'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('Input component', () => {
  test('should render input with default props', () => {
    render(<Input placeholder="Enter text" />)

    const input = screen.getByPlaceholderText('Enter text')
    expect(input).toBeInTheDocument()
    expect(input).toHaveClass('flex', 'h-9', 'w-full', 'rounded-md', 'border', 'px-3', 'py-1')
  })

  test('should render input with different type', () => {
    render(<Input type="email" placeholder="Enter email" />)

    const input = screen.getByPlaceholderText('Enter email')
    expect(input).toHaveAttribute('type', 'email')
  })

  test('should render input with custom className', () => {
    render(<Input className="custom-class" />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('custom-class')
  })

  test('should handle value changes', async () => {
    const user = userEvent.setup()
    const handleChange = jest.fn()

    render(<Input onChange={handleChange} />)

    const input = screen.getByRole('textbox')
    await user.type(input, 'Hello World')

    expect(handleChange).toHaveBeenCalledTimes(11) // Once for each character
  })

  test('should be disabled when disabled prop is true', () => {
    render(<Input disabled />)

    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
    expect(input).toHaveClass('disabled:pointer-events-none', 'disabled:cursor-not-allowed', 'disabled:opacity-50')
  })

  test('should have required attribute when required prop is true', () => {
    render(<Input required />)

    const input = screen.getByRole('textbox')
    expect(input).toBeRequired()
  })

  test('should pass additional props to input element', () => {
    render(<Input data-testid="test-input" aria-label="Test input" />)

    const input = screen.getByTestId('test-input')
    expect(input).toHaveAttribute('aria-label', 'Test input')
  })

  test('should handle focus events', () => {
    const handleFocus = jest.fn()
    const handleBlur = jest.fn()

    render(<Input onFocus={handleFocus} onBlur={handleBlur} />)

    const input = screen.getByRole('textbox')
    
    fireEvent.focus(input)
    expect(handleFocus).toHaveBeenCalledTimes(1)

    fireEvent.blur(input)
    expect(handleBlur).toHaveBeenCalledTimes(1)
  })

  test('should have correct data-slot attribute', () => {
    render(<Input />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('data-slot', 'input')
  })

  test('should handle file input type', () => {
    render(<Input type="file" />)

    const fileInput = document.querySelector('input[type="file"]')
    expect(fileInput).toBeInTheDocument()
    expect(fileInput).toHaveAttribute('type', 'file')
  })

  test('should have proper styling for invalid state', () => {
    render(<Input aria-invalid="true" />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('aria-invalid:ring-destructive/20', 'dark:aria-invalid:ring-destructive/40', 'aria-invalid:border-destructive')
  })

  test('should have focus-visible styles', () => {
    render(<Input />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('focus-visible:border-ring', 'focus-visible:ring-ring/50', 'focus-visible:ring-[3px]')
  })
})