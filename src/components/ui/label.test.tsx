import { Label } from './label'
import { render, screen } from '@testing-library/react'

// Mock @radix-ui/react-label
jest.mock('@radix-ui/react-label', () => ({
  Root: ({ children, className, ...props }: any) => (
    <label className={className} {...props}>
      {children}
    </label>
  ),
}))

describe('Label component', () => {
  test('should render label with default classes', () => {
    render(<Label>Test Label</Label>)

    const label = screen.getByText('Test Label')
    expect(label).toBeInTheDocument()
    expect(label.tagName).toBe('LABEL')
    expect(label).toHaveClass(
      'flex',
      'items-center',
      'gap-2',
      'text-sm',
      'leading-none',
      'font-medium',
      'select-none'
    )
  })

  test('should render label with custom className', () => {
    render(<Label className="custom-class">Custom Label</Label>)

    const label = screen.getByText('Custom Label')
    expect(label).toHaveClass('custom-class')
  })

  test('should have correct data-slot attribute', () => {
    render(<Label>Test Label</Label>)

    const label = screen.getByText('Test Label')
    expect(label).toHaveAttribute('data-slot', 'label')
  })

  test('should pass additional props to label element', () => {
    render(<Label htmlFor="test-input" aria-label="Test label">Test</Label>)

    const label = screen.getByText('Test')
    expect(label).toHaveAttribute('for', 'test-input')
    expect(label).toHaveAttribute('aria-label', 'Test label')
  })

  test('should handle disabled state classes', () => {
    render(
      <div data-disabled="true">
        <Label>Disabled Label</Label>
      </div>
    )

    const label = screen.getByText('Disabled Label')
    expect(label).toHaveClass(
      'group-data-[disabled=true]:pointer-events-none',
      'group-data-[disabled=true]:opacity-50'
    )
  })

  test('should handle peer disabled state classes', () => {
    render(
      <div className="peer-disabled">
        <Label>Peer Disabled Label</Label>
      </div>
    )

    const label = screen.getByText('Peer Disabled Label')
    expect(label).toHaveClass('peer-disabled:cursor-not-allowed', 'peer-disabled:opacity-50')
  })

  test('should render children content correctly', () => {
    render(
      <Label>
        <span>Child content</span>
      </Label>
    )

    const label = screen.getByText('Child content')
    expect(label).toBeInTheDocument()
    expect(label.tagName).toBe('SPAN')
  })

  test('should be accessible as a label', () => {
    render(
      <div>
        <Label htmlFor="input-field">Input Label</Label>
        <input id="input-field" type="text" />
      </div>
    )

    const input = screen.getByLabelText('Input Label')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('id', 'input-field')
    
    const label = screen.getByText('Input Label')
    expect(label).toHaveAttribute('for', 'input-field')
  })
})