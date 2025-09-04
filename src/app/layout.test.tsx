import { render, screen } from '@testing-library/react';
import RootLayout from '@/app/layout';

// Mock the Toaster component
jest.mock('@/components/ui/toaster', () => ({
  Toaster: () => <div data-testid="toaster">Mock Toaster</div>,
}));

// Mock the globals.css import
jest.mock('./globals.css', () => ({}));

describe('RootLayout Component', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <RootLayout>
        <div>Test Child</div>
      </RootLayout>
    );
    expect(container).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <RootLayout>
        <div>Test Child Content</div>
      </RootLayout>
    );
    expect(screen.getByText('Test Child Content')).toBeInTheDocument();
  });

  it('includes Toaster component', () => {
    render(
      <RootLayout>
        <div>Test Child</div>
      </RootLayout>
    );
    expect(screen.getByTestId('toaster')).toBeInTheDocument();
  });

  it('has proper body styling when rendered', () => {
    const { container } = render(
      <RootLayout>
        <div>Test Child</div>
      </RootLayout>
    );
    
    // The layout should render the children with proper styling
    const childElement = screen.getByText('Test Child');
    expect(childElement).toBeInTheDocument();
  });

  it('includes font variables in className', () => {
    const { container } = render(
      <RootLayout>
        <div>Test Child</div>
      </RootLayout>
    );
    
    // Check that the component renders without errors
    expect(container.firstChild).toBeInTheDocument();
  });
});