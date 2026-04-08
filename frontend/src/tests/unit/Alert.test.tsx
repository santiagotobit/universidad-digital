import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { Alert } from '../../components/Alert';

describe('Alert - Unit Behavior Tests', () => {
  it('renders error message when message prop is provided', () => {
    render(<Alert message="Invalid credentials" type="error" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });

  it('shows success message and has role alert', () => {
    render(<Alert message="Saved successfully" type="success" />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Saved successfully');
  });

  it('shows warning message', () => {
    render(<Alert message="Please confirm" type="warning" />);
    expect(screen.getByText('Please confirm')).toBeInTheDocument();
  });

  it('renders with title when provided', () => {
    render(<Alert message="Details here" title="Error" type="error" />);
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Details here')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<Alert message="Dismiss me" onClose={onClose} type="info" />);
    const closeBtn = screen.getByRole('button', { name: /cerrar alerta/i });
    await user.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not show close button when onClose is not provided', () => {
    render(<Alert message="No close" type="error" />);
    expect(screen.queryByRole('button', { name: /cerrar/i })).not.toBeInTheDocument();
  });
});
