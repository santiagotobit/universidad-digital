import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../../components/Input';

describe('Input - Functional UI Tests', () => {
  const user = userEvent.setup();

  it('displays error after typing invalid input', async () => {
    // Since no validation logic, simulate by providing error prop
    const { rerender } = render(<Input label="Email" />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'invalid');

    // In real app, this would trigger validation
    rerender(<Input label="Email" error="Invalid email format" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('removes error when input becomes valid', async () => {
    const { rerender } = render(<Input label="Email" error="Invalid" />);

    expect(screen.getByRole('alert')).toBeInTheDocument();

    rerender(<Input label="Email" />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('maintains value when error is shown', async () => {
    const { rerender } = render(<Input label="Field" />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'value');

    rerender(<Input label="Field" error="Error" />);
    expect(input).toHaveValue('value');
  });
});