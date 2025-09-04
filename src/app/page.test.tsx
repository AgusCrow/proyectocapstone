import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

describe('Home Component', () => {
  it('renders without crashing', () => {
    render(<Home />);
    expect(screen.getByAltText('Z.ai Logo')).toBeInTheDocument();
  });

  it('displays the Z.ai logo', () => {
    render(<Home />);
    const logo = screen.getByAltText('Z.ai Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/logo.svg');
  });

  it('has proper flex container styling', () => {
    const { container } = render(<Home />);
    const mainDiv = container.firstChild;
    expect(mainDiv).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center', 'min-h-screen', 'gap-8', 'p-4');
  });

  it('contains a logo container with responsive sizing', () => {
    const { container } = render(<Home />);
    const logoContainer = container.querySelector('div > div');
    expect(logoContainer).toBeInTheDocument();
  });

  it('logo image has object-contain class', () => {
    render(<Home />);
    const logo = screen.getByAltText('Z.ai Logo');
    expect(logo).toHaveClass('w-full', 'h-full', 'object-contain');
  });
});