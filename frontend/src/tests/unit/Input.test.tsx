import { render, screen } from '@testing-library/react';
import { Input } from '../../components/Input';

describe('Input - Unit Behavior Tests', () => {
  it('renders label and input', () => {
    render(<Input label="Username" />);

    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /username/i })).toBeInTheDocument();
  });

  it('generates id from label when not provided', () => {
    render(<Input label="Email Address" />);

    const input = screen.getByLabelText('Email Address');
    expect(input).toHaveAttribute('id', 'email-address');
  });

  it('uses provided id', () => {
    render(<Input label="Password" id="pwd" />);

    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('id', 'pwd');
  });

  it('uses name as id when provided', () => {
    render(<Input label="Name" name="fullName" />);

    const input = screen.getByLabelText('Name');
    expect(input).toHaveAttribute('id', 'fullName');
  });

  it('does not show error when no error prop', () => {
    render(<Input label="Input" />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows error message when error prop provided', () => {
    render(<Input label="Email" error="Invalid email" />);

    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email');
  });

  it('sets aria-invalid when error present', () => {
    render(<Input label="Field" error="Error" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('sets aria-describedby when error present', () => {
    render(<Input label="Field" error="Error" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-describedby', expect.stringContaining('-error'));
  });

  it('passes through other input props', () => {
    render(<Input label="Test" type="password" placeholder="Enter value" />);

    const input = screen.getByLabelText('Test');
    expect(input).toHaveAttribute('type', 'password');
    expect(input).toHaveAttribute('placeholder', 'Enter value');
  });

  it('does not show error region when error is empty string', () => {
    render(<Input label="Field" error="" />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});