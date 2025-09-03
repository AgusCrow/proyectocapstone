import RootLayout from './layout'
import { Toaster } from '@/components/ui/toaster'
import { render, screen } from '@testing-library/react'

// Mock the Toaster component
jest.mock('@/components/ui/toaster', () => ({
  Toaster: jest.fn(() => <div data-testid="toaster">Mocked Toaster</div>),
}))

// Mock next/font/google
jest.mock('next/font/google', () => ({
  Geist: jest.fn(() => ({
    variable: '--font-geist-sans',
  })),
  Geist_Mono: jest.fn(() => ({
    variable: '--font-geist-mono',
  })),
}))

// Mock the CSS import
jest.mock('./globals.css', () => ({}))

describe('RootLayout', () => {
  const mockChildren = <div data-testid="mock-children">Mock Children</div>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should render children content', () => {
    const { container } = render(<RootLayout>{mockChildren}</RootLayout>)

    const childrenElement = screen.getByTestId('mock-children')
    expect(childrenElement).toBeInTheDocument()
    expect(childrenElement).toHaveTextContent('Mock Children')
  })

  test('should render Toaster component', () => {
    render(<RootLayout>{mockChildren}</RootLayout>)

    const toasterElement = screen.getByTestId('toaster')
    expect(toasterElement).toBeInTheDocument()
    expect(Toaster).toHaveBeenCalled()
  })

  test('should have correct metadata', () => {
    // Import metadata to test it
    const { metadata } = require('./layout')

    expect(metadata).toBeDefined()
    expect(metadata.title).toBe('Z.ai Code Scaffold - AI-Powered Development')
    expect(metadata.description).toContain('Modern Next.js scaffold optimized for AI-powered development')
    expect(metadata.keywords).toEqual([
      'Z.ai',
      'Next.js',
      'TypeScript',
      'Tailwind CSS',
      'shadcn/ui',
      'AI development',
      'React',
    ])
    expect(metadata.authors).toEqual([{ name: 'Z.ai Team' }])
  })

  test('should have correct OpenGraph metadata', () => {
    const { metadata } = require('./layout')

    expect(metadata.openGraph).toBeDefined()
    expect(metadata.openGraph?.title).toBe('Z.ai Code Scaffold')
    expect(metadata.openGraph?.description).toBe('AI-powered development with modern React stack')
    expect(metadata.openGraph?.url).toBe('https://chat.z.ai')
    expect(metadata.openGraph?.siteName).toBe('Z.ai')
    expect(metadata.openGraph?.type).toBe('website')
  })

  test('should have correct Twitter metadata', () => {
    const { metadata } = require('./layout')

    expect(metadata.twitter).toBeDefined()
    expect(metadata.twitter?.card).toBe('summary_large_image')
    expect(metadata.twitter?.title).toBe('Z.ai Code Scaffold')
    expect(metadata.twitter?.description).toBe('AI-powered development with modern React stack')
  })

  test('should render without crashing', () => {
    expect(() => render(<RootLayout>{mockChildren}</RootLayout>)).not.toThrow()
  })
})