import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
} from './card'
import { render, screen } from '@testing-library/react'

describe('Card components', () => {
  describe('Card', () => {
    test('should render card with default classes', () => {
      render(<Card>Card content</Card>)

      const card = screen.getByText('Card content')
      expect(card).toBeInTheDocument()
      expect(card).toHaveClass('bg-card', 'text-card-foreground', 'flex', 'flex-col', 'gap-6', 'rounded-xl', 'border', 'py-6', 'shadow-sm')
    })

    test('should render card with custom className', () => {
      render(<Card className="custom-class">Card content</Card>)

      const card = screen.getByText('Card content')
      expect(card).toHaveClass('custom-class')
    })

    test('should have correct data-slot attribute', () => {
      render(<Card>Card content</Card>)

      const card = screen.getByText('Card content')
      expect(card).toHaveAttribute('data-slot', 'card')
    })

    test('should pass additional props to div element', () => {
      render(<Card data-testid="test-card">Card content</Card>)

      const card = screen.getByTestId('test-card')
      expect(card).toBeInTheDocument()
    })
  })

  describe('CardHeader', () => {
    test('should render card header with default classes', () => {
      render(<CardHeader>Header content</CardHeader>)

      const header = screen.getByText('Header content')
      expect(header).toBeInTheDocument()
      expect(header).toHaveClass('@container/card-header', 'grid', 'auto-rows-min', 'grid-rows-[auto_auto]', 'items-start', 'gap-1.5', 'px-6')
    })

    test('should render card header with custom className', () => {
      render(<CardHeader className="custom-class">Header content</CardHeader>)

      const header = screen.getByText('Header content')
      expect(header).toHaveClass('custom-class')
    })

    test('should have correct data-slot attribute', () => {
      render(<CardHeader>Header content</CardHeader>)

      const header = screen.getByText('Header content')
      expect(header).toHaveAttribute('data-slot', 'card-header')
    })
  })

  describe('CardTitle', () => {
    test('should render card title with default classes', () => {
      render(<CardTitle>Card Title</CardTitle>)

      const title = screen.getByText('Card Title')
      expect(title).toBeInTheDocument()
      expect(title).toHaveClass('leading-none', 'font-semibold')
    })

    test('should render card title with custom className', () => {
      render(<CardTitle className="custom-class">Card Title</CardTitle>)

      const title = screen.getByText('Card Title')
      expect(title).toHaveClass('custom-class')
    })

    test('should have correct data-slot attribute', () => {
      render(<CardTitle>Card Title</CardTitle>)

      const title = screen.getByText('Card Title')
      expect(title).toHaveAttribute('data-slot', 'card-title')
    })
  })

  describe('CardDescription', () => {
    test('should render card description with default classes', () => {
      render(<CardDescription>Card description</CardDescription>)

      const description = screen.getByText('Card description')
      expect(description).toBeInTheDocument()
      expect(description).toHaveClass('text-muted-foreground', 'text-sm')
    })

    test('should render card description with custom className', () => {
      render(<CardDescription className="custom-class">Card description</CardDescription>)

      const description = screen.getByText('Card description')
      expect(description).toHaveClass('custom-class')
    })

    test('should have correct data-slot attribute', () => {
      render(<CardDescription>Card description</CardDescription>)

      const description = screen.getByText('Card description')
      expect(description).toHaveAttribute('data-slot', 'card-description')
    })
  })

  describe('CardAction', () => {
    test('should render card action with default classes', () => {
      render(<CardAction>Action content</CardAction>)

      const action = screen.getByText('Action content')
      expect(action).toBeInTheDocument()
      expect(action).toHaveClass('col-start-2', 'row-span-2', 'row-start-1', 'self-start', 'justify-self-end')
    })

    test('should render card action with custom className', () => {
      render(<CardAction className="custom-class">Action content</CardAction>)

      const action = screen.getByText('Action content')
      expect(action).toHaveClass('custom-class')
    })

    test('should have correct data-slot attribute', () => {
      render(<CardAction>Action content</CardAction>)

      const action = screen.getByText('Action content')
      expect(action).toHaveAttribute('data-slot', 'card-action')
    })
  })

  describe('CardContent', () => {
    test('should render card content with default classes', () => {
      render(<CardContent>Content</CardContent>)

      const content = screen.getByText('Content')
      expect(content).toBeInTheDocument()
      expect(content).toHaveClass('px-6')
    })

    test('should render card content with custom className', () => {
      render(<CardContent className="custom-class">Content</CardContent>)

      const content = screen.getByText('Content')
      expect(content).toHaveClass('custom-class')
    })

    test('should have correct data-slot attribute', () => {
      render(<CardContent>Content</CardContent>)

      const content = screen.getByText('Content')
      expect(content).toHaveAttribute('data-slot', 'card-content')
    })
  })

  describe('CardFooter', () => {
    test('should render card footer with default classes', () => {
      render(<CardFooter>Footer content</CardFooter>)

      const footer = screen.getByText('Footer content')
      expect(footer).toBeInTheDocument()
      expect(footer).toHaveClass('flex', 'items-center', 'px-6')
    })

    test('should render card footer with custom className', () => {
      render(<CardFooter className="custom-class">Footer content</CardFooter>)

      const footer = screen.getByText('Footer content')
      expect(footer).toHaveClass('custom-class')
    })

    test('should have correct data-slot attribute', () => {
      render(<CardFooter>Footer content</CardFooter>)

      const footer = screen.getByText('Footer content')
      expect(footer).toHaveAttribute('data-slot', 'card-footer')
    })
  })

  describe('Card composition', () => {
    test('should render complete card structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Title</CardTitle>
            <CardDescription>Test Description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card content goes here</p>
          </CardContent>
          <CardFooter>
            <button>Action</button>
          </CardFooter>
        </Card>
      )

      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByText('Test Description')).toBeInTheDocument()
      expect(screen.getByText('Card content goes here')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
    })
  })
})