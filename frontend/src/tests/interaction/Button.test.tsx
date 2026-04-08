import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../../components/Button';
import { vi } from 'vitest';

describe('Button - Interaction Tests', () => {
  const user = userEvent.setup();

  it('calls onClick when clicked', async () => {
    const mockOnClick = vi.fn();
    render(<Button onClick={mockOnClick}>Click me</Button>);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('supports keyboard activation', async () => {
    const mockOnClick = vi.fn();
    render(<Button onClick={mockOnClick}>Button</Button>);

    const button = screen.getByRole('button');
    button.focus();
    await user.keyboard('{enter}');

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', async () => {
    const mockOnClick = vi.fn();
    render(<Button onClick={mockOnClick} disabled>Disabled</Button>);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(mockOnClick).not.toHaveBeenCalled();
  });
});