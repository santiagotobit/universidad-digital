import { render, screen } from '@testing-library/react';
import { Button } from '../../components/Button';
import { vi } from 'vitest';

describe('Button - Unit Behavior Tests', () => {
  it('renders with default primary variant', () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('button');
    expect(button).not.toHaveClass('secondary');
    expect(button).not.toHaveClass('danger');
  });

  it('renders with secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>);

    const button = screen.getByRole('button', { name: /secondary/i });
    expect(button).toHaveClass('button', 'secondary');
  });

  it('renders with danger variant', () => {
    render(<Button variant="danger">Danger</Button>);

    const button = screen.getByRole('button', { name: /danger/i });
    expect(button).toHaveClass('button', 'danger');
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Button</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('button', 'custom-class');
  });

  it('passes through other props', () => {
    render(<Button type="submit" data-testid="submit-btn">Submit</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('is enabled by default', () => {
    render(<Button>Enabled</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeEnabled();
  });

  it('can be disabled', () => {
    render(<Button disabled>Disabled</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});