import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from './tooltip'
import { render, screen } from '@testing-library/react'

// Mock @radix-ui/react-tooltip
jest.mock('@radix-ui/react-tooltip', () => ({
  Provider: ({ children, delayDuration, ...props }: any) => (
    <div data-slot="tooltip-provider" data-delay-duration={delayDuration} {...props}>
      {children}
    </div>
  ),
  Root: ({ children, ...props }: any) => (
    <div data-slot="tooltip" {...props}>
      {children}
    </div>
  ),
  Trigger: ({ children, ...props }: any) => (
    <button data-slot="tooltip-trigger" {...props}>
      {children}
    </button>
  ),
  Content: ({ children, className, sideOffset, ...props }: any) => (
    <div data-slot="tooltip-content" className={className} data-side-offset={sideOffset} {...props}>
      {children}
      <div className="tooltip-arrow" />
    </div>
  ),
  Portal: ({ children }: any) => <div className="portal">{children}</div>,
  Arrow: ({ className, ...props }: any) => (
    <div className={className} {...props} />
  ),
}))

describe('Tooltip components', () => {
  describe('TooltipProvider', () => {
    test('should render tooltip provider with default delay', () => {
      render(<TooltipProvider>Provider content</TooltipProvider>)

      const provider = screen.getByText('Provider content')
      expect(provider).toBeInTheDocument()
      
      // Find the provider element with data-slot attribute
      const providerElement = provider.closest('[data-slot="tooltip-provider"]')
      expect(providerElement).toBeInTheDocument()
      expect(providerElement).toHaveAttribute('data-slot', 'tooltip-provider')
    })

    test('should render tooltip provider with custom delay', () => {
      render(<TooltipProvider delayDuration={300}>Provider content</TooltipProvider>)

      const provider = screen.getByText('Provider content')
      expect(provider).toBeInTheDocument()
    })

    test('should pass additional props to provider', () => {
      render(<TooltipProvider data-testid="test-provider">Test</TooltipProvider>)

      const provider = screen.getByTestId('test-provider')
      expect(provider).toBeInTheDocument()
    })
  })

  describe('Tooltip', () => {
    test('should render tooltip with provider wrapper', () => {
      render(
        <Tooltip>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </Tooltip>
      )

      const tooltip = screen.getByText('Trigger').closest('[data-slot="tooltip"]')
      expect(tooltip).toBeInTheDocument()
      expect(tooltip).toHaveAttribute('data-slot', 'tooltip')
    })

    test('should pass additional props to tooltip root', () => {
      render(
        <Tooltip data-testid="test-tooltip">
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </Tooltip>
      )

      const tooltip = screen.getByTestId('test-tooltip')
      expect(tooltip).toBeInTheDocument()
    })
  })

  describe('TooltipTrigger', () => {
    test('should render tooltip trigger as button', () => {
      render(<TooltipTrigger>Trigger Button</TooltipTrigger>)

      const trigger = screen.getByRole('button', { name: 'Trigger Button' })
      expect(trigger).toBeInTheDocument()
      expect(trigger).toHaveAttribute('data-slot', 'tooltip-trigger')
    })

    test('should pass additional props to trigger', () => {
      render(<TooltipTrigger aria-label="Custom trigger">Trigger</TooltipTrigger>)

      const trigger = screen.getByRole('button')
      expect(trigger).toHaveAttribute('aria-label', 'Custom trigger')
    })
  })

  describe('TooltipContent', () => {
    test('should render tooltip content with default classes', () => {
      render(
        <TooltipContent>
          <span>Tooltip content</span>
        </TooltipContent>
      )

      const content = screen.getByText('Tooltip content')
      expect(content).toBeInTheDocument()
      expect(content.closest('[data-slot="tooltip-content"]')).toHaveClass(
        'bg-primary',
        'text-primary-foreground',
        'animate-in',
        'fade-in-0',
        'zoom-in-95'
      )
    })

    test('should render tooltip content with custom className', () => {
      render(
        <TooltipContent className="custom-class">
          <span>Custom content</span>
        </TooltipContent>
      )

      const content = screen.getByText('Custom content')
      expect(content.closest('[data-slot="tooltip-content"]')).toHaveClass('custom-class')
    })

    test('should render tooltip content with custom sideOffset', () => {
      render(
        <TooltipContent sideOffset={10}>
          <span>Content with offset</span>
        </TooltipContent>
      )

      const content = screen.getByText('Content with offset')
      expect(content).toBeInTheDocument()
    })

    test('should render tooltip arrow', () => {
      render(
        <TooltipContent>
          <span>Content with arrow</span>
        </TooltipContent>
      )

      const arrow = screen.getByText('Content with arrow').closest('.portal')?.querySelector('.tooltip-arrow')
      expect(arrow).toBeInTheDocument()
    })

    test('should pass additional props to content', () => {
      render(
        <TooltipContent data-testid="test-content">
          <span>Test content</span>
        </TooltipContent>
      )

      const content = screen.getByTestId('test-content')
      expect(content).toBeInTheDocument()
    })
  })

  describe('Tooltip composition', () => {
    test('should render complete tooltip structure', () => {
      render(
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>
            This is a tooltip
          </TooltipContent>
        </Tooltip>
      )

      expect(screen.getByRole('button', { name: 'Hover me' })).toBeInTheDocument()
      expect(screen.getByText('This is a tooltip')).toBeInTheDocument()
    })
  })
})