import { render } from '@testing-library/react'
import RootLayout from './layout'

// Mock next/font/google
jest.mock('next/font/google', () => ({
  Geist: jest.fn(() => ({
    variable: '--font-geist-sans',
    subsets: ['latin'],
  })),
  Geist_Mono: jest.fn(() => ({
    variable: '--font-geist-mono',
    subsets: ['latin'],
  })),
}))

// Mock Toaster component
jest.mock('../components/ui/toaster', () => ({
  Toaster: () => <div data-testid="toaster" />,
}))

describe('RootLayout', () => {
  test('should render children content', () => {
    const { getByTestId } = render(
      <RootLayout>
        <div data-testid="child-content">Test Content</div>
      </RootLayout>
    )
    
    expect(getByTestId('child-content')).toBeInTheDocument()
    expect(getByTestId('child-content')).toHaveTextContent('Test Content')
  })

  test('should include Toaster component', () => {
    const { getByTestId } = render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    )
    
    expect(getByTestId('toaster')).toBeInTheDocument()
  })

  test('should render without errors', () => {
    expect(() => render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    )).not.toThrow()
  })

  test('should handle multiple children', () => {
    const { container } = render(
      <RootLayout>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </RootLayout>
    )
    
    expect(container.querySelector('[data-testid="child-1"]')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="child-2"]')).toBeInTheDocument()
  })

  test('should handle empty children', () => {
    expect(() => render(<RootLayout>{null}</RootLayout>)).not.toThrow()
  })
})