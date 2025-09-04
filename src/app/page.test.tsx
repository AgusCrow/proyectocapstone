import { render, screen } from '@testing-library/react'
import Home from './page'

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />
  },
}))

describe('Home Page', () => {
  test('should render the home page with logo', () => {
    render(<Home />)
    
    const logo = screen.getByAltText('Z.ai Logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('src', '/logo.svg')
  })

  test('should have proper flex container styling', () => {
    const { container } = render(<Home />)
    
    const mainDiv = container.firstChild as HTMLElement
    expect(mainDiv).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center', 'min-h-screen', 'gap-8', 'p-4')
  })

  test('should have logo container with responsive sizing', () => {
    const { container } = render(<Home />)
    
    // Find the logo container (it should be the div containing the image)
    const logoContainer = container.querySelector('img')?.parentElement
    expect(logoContainer).toBeInTheDocument()
    // Check for the presence of key classes
    expect(logoContainer?.className).toContain('relative')
    expect(logoContainer?.className).toContain('w-24')
    expect(logoContainer?.className).toContain('h-24')
  })

  test('should render without errors', () => {
    expect(() => render(<Home />)).not.toThrow()
  })

  test('should have proper image attributes', () => {
    render(<Home />)
    
    const logo = screen.getByAltText('Z.ai Logo')
    expect(logo).toHaveClass('w-full', 'h-full', 'object-contain')
  })

  test('should be accessible with proper alt text', () => {
    render(<Home />)
    
    const logo = screen.getByAltText('Z.ai Logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toBeVisible()
  })
})