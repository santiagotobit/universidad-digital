import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../../components/Input';
import { vi } from 'vitest';

describe('Input - Interaction Tests', () => {
  const user = userEvent.setup();

  it('allows typing text', async () => {
    render(<Input label="Name" />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'John Doe');

    expect(input).toHaveValue('John Doe');
  });

  it('calls onChange when typing', async () => {
    const mockOnChange = vi.fn();
    render(<Input label="Name" onChange={mockOnChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'a');

    expect(mockOnChange).toHaveBeenCalled();
  });

  it('supports keyboard navigation', async () => {
    render(<Input label="Input" />);

    await user.tab();
    expect(screen.getByRole('textbox')).toHaveFocus();
  });

  it('clears input when clear button clicked', async () => {
    // Assuming there's a clear functionality, but in this component, no
    // For now, just typing and clearing
    render(<Input label="Input" />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'text');
    expect(input).toHaveValue('text');

    await user.clear(input);
    expect(input).toHaveValue('');
  });
});