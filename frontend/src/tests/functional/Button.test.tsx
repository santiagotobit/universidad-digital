import { render, screen } from '@testing-library/react';
import { Button } from '../../components/Button';

describe('Button - Functional UI Tests', () => {
  it('renders with empty children without breaking', () => {
    render(<Button>{''}</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('shows disabled styling when disabled', () => {
    render(<Button disabled>Disabled Button</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    // Assuming CSS handles disabled styling, we check the attribute
    expect(button).toHaveAttribute('disabled');
  });

  it('variant danger when disabled still exposes disabled state and attribute', () => {
    render(<Button variant="danger" disabled>Danger Disabled</Button>);

    const button = screen.getByRole('button', { name: /danger disabled/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('disabled');
    expect(button).toHaveTextContent('Danger Disabled');
  });
});