import Home from './page'
import { render, screen } from '@testing-library/react'

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}))

describe('Home Page', () => {
  test('should render the home page correctly', () => {
    render(<Home />)

    // Check if the main container is rendered
    const mainContainer = screen.getByRole('img', { hidden: true }).closest('.flex.flex-col')
    expect(mainContainer).toBeInTheDocument()
    expect(mainContainer).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center', 'min-h-screen', 'gap-8', 'p-4')
  })

  test('should render the logo container', () => {
    render(<Home />)

    const logoContainer = screen.getByRole('img', { hidden: true }).parentElement
    expect(logoContainer).toBeInTheDocument()
    expect(logoContainer).toHaveClass('relative', 'w-24', 'h-24', 'md:w-32', 'md:h-32')
  })

  test('should render the logo image with correct attributes', () => {
    render(<Home />)

    const logoImage = screen.getByAltText('Z.ai Logo')
    expect(logoImage).toBeInTheDocument()
    expect(logoImage).toHaveAttribute('src', '/logo.svg')
    expect(logoImage).toHaveClass('w-full', 'h-full', 'object-contain')
  })

  test('should have responsive design classes', () => {
    render(<Home />)

    const logoContainer = screen.getByAltText('Z.ai Logo').parentElement
    expect(logoContainer).toHaveClass('w-24', 'h-24', 'md:w-32', 'md:h-32')
  })

  test('should maintain proper spacing with gap classes', () => {
    render(<Home />)

    const mainContainer = screen.getByRole('img', { hidden: true }).closest('.flex.flex-col')
    expect(mainContainer).toHaveClass('gap-8')
  })

  test('should have proper padding', () => {
    render(<Home />)

    const mainContainer = screen.getByRole('img', { hidden: true }).closest('.flex.flex-col')
    expect(mainContainer).toHaveClass('p-4')
  })

  test('should center content properly', () => {
    render(<Home />)

    const mainContainer = screen.getByRole('img', { hidden: true }).closest('.flex.flex-col')
    expect(mainContainer).toHaveClass('items-center', 'justify-center')
  })

  test('should take full viewport height', () => {
    render(<Home />)

    const mainContainer = screen.getByRole('img', { hidden: true }).closest('.flex.flex-col')
    expect(mainContainer).toHaveClass('min-h-screen')
  })
})