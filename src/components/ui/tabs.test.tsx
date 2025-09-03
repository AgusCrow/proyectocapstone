import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from './tabs'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock @radix-ui/react-tabs
jest.mock('@radix-ui/react-tabs', () => ({
  Root: ({ children, className, ...props }: any) => (
    <div data-slot="tabs" className={className} {...props}>
      {children}
    </div>
  ),
  List: ({ children, className, ...props }: any) => (
    <div data-slot="tabs-list" className={className} {...props}>
      {children}
    </div>
  ),
  Trigger: ({ children, className, ...props }: any) => (
    <button role="tab" className={className} data-slot="tabs-trigger" {...props}>
      {children}
    </button>
  ),
  Content: ({ children, className, ...props }: any) => (
    <div data-slot="tabs-content" className={className} {...props}>
      {children}
    </div>
  ),
}))

describe('Tabs components', () => {
  describe('Tabs', () => {
    test('should render tabs with default classes', () => {
      render(
        <Tabs>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      )

      const tabs = screen.getByText('Tab 1').closest('[data-slot="tabs"]')
      expect(tabs).toBeInTheDocument()
      expect(tabs).toHaveClass('flex', 'flex-col', 'gap-2')
    })

    test('should render tabs with custom className', () => {
      render(
        <Tabs className="custom-class">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>
      )

      const tabs = screen.getByText('Tab 1').closest('[data-slot="tabs"]')
      expect(tabs).toHaveClass('custom-class')
    })

    test('should pass additional props to tabs root', () => {
      render(
        <Tabs data-testid="test-tabs" defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>
      )

      const tabs = screen.getByTestId('test-tabs')
      expect(tabs).toBeInTheDocument()
    })
  })

  describe('TabsList', () => {
    test('should render tabs list with default classes', () => {
      render(
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
      )

      const tabsList = screen.getByText('Tab 1').closest('[data-slot="tabs-list"]')
      expect(tabsList).toBeInTheDocument()
      expect(tabsList).toHaveClass(
        'bg-muted',
        'text-muted-foreground',
        'inline-flex',
        'h-9',
        'w-fit',
        'items-center',
        'justify-center',
        'rounded-lg',
        'p-[3px]'
      )
    })

    test('should render tabs list with custom className', () => {
      render(
        <TabsList className="custom-class">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      )

      const tabsList = screen.getByText('Tab 1').closest('[data-slot="tabs-list"]')
      expect(tabsList).toHaveClass('custom-class')
    })

    test('should pass additional props to tabs list', () => {
      render(
        <TabsList data-testid="test-tabs-list">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      )

      const tabsList = screen.getByTestId('test-tabs-list')
      expect(tabsList).toBeInTheDocument()
    })
  })

  describe('TabsTrigger', () => {
    test('should render tabs trigger with default classes', () => {
      render(<TabsTrigger value="tab1">Tab 1</TabsTrigger>)

      const trigger = screen.getByRole('tab', { name: 'Tab 1' })
      expect(trigger).toBeInTheDocument()
      expect(trigger).toHaveAttribute('data-slot', 'tabs-trigger')
      expect(trigger).toHaveClass(
        'data-[state=active]:bg-background',
        'text-foreground',
        'inline-flex',
        'h-[calc(100%-1px)]',
        'flex-1',
        'items-center',
        'justify-center',
        'gap-1.5',
        'rounded-md',
        'border',
        'border-transparent',
        'px-2',
        'py-1',
        'text-sm',
        'font-medium',
        'whitespace-nowrap',
        'transition-[color,box-shadow]'
      )
    })

    test('should render tabs trigger with custom className', () => {
      render(<TabsTrigger className="custom-class" value="tab1">Tab 1</TabsTrigger>)

      const trigger = screen.getByRole('tab', { name: 'Tab 1' })
      expect(trigger).toHaveClass('custom-class')
    })

    test('should handle click events', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()

      render(
        <TabsTrigger value="tab1" onClick={handleClick}>
          Tab 1
        </TabsTrigger>
      )

      const trigger = screen.getByRole('tab', { name: 'Tab 1' })
      await user.click(trigger)

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    test('should be disabled when disabled prop is true', () => {
      render(<TabsTrigger disabled value="tab1">Tab 1</TabsTrigger>)

      const trigger = screen.getByRole('tab', { name: 'Tab 1' })
      expect(trigger).toBeDisabled()
      expect(trigger).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50')
    })

    test('should pass additional props to tabs trigger', () => {
      render(
        <TabsTrigger data-testid="test-trigger" value="tab1" aria-label="Test trigger">
          Tab 1
        </TabsTrigger>
      )

      const trigger = screen.getByTestId('test-trigger')
      expect(trigger).toHaveAttribute('aria-label', 'Test trigger')
    })
  })

  describe('TabsContent', () => {
    test('should render tabs content with default classes', () => {
      render(<TabsContent value="tab1">Content 1</TabsContent>)

      const content = screen.getByText('Content 1')
      expect(content).toBeInTheDocument()
      expect(content.closest('[data-slot="tabs-content"]')).toHaveClass('flex-1', 'outline-none')
    })

    test('should render tabs content with custom className', () => {
      render(
        <TabsContent className="custom-class" value="tab1">
          Content 1
        </TabsContent>
      )

      const content = screen.getByText('Content 1')
      expect(content.closest('[data-slot="tabs-content"]')).toHaveClass('custom-class')
    })

    test('should pass additional props to tabs content', () => {
      render(
        <TabsContent data-testid="test-content" value="tab1">
          Content 1
        </TabsContent>
      )

      const content = screen.getByTestId('test-content')
      expect(content).toBeInTheDocument()
    })
  })

  describe('Tabs composition', () => {
    test('should render complete tabs structure', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      )

      expect(screen.getByRole('tab', { name: 'Tab 1' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Tab 2' })).toBeInTheDocument()
      expect(screen.getByText('Content 1')).toBeInTheDocument()
      expect(screen.getByText('Content 2')).toBeInTheDocument()
    })
  })
})