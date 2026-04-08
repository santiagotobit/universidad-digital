import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskForm } from '../../components/TaskForm';
import { vi } from 'vitest';

describe('TaskForm - Functional UI Tests', () => {
  const mockOnCreateTask = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    mockOnCreateTask.mockClear();
  });

  it('enables button when input has text', async () => {
    render(<TaskForm onCreateTask={mockOnCreateTask} />);

    const input = screen.getByRole('textbox', { name: /task/i });
    const button = screen.getByRole('button', { name: /add task/i });

    expect(button).toBeDisabled();

    await user.type(input, 'Valid task');

    expect(button).toBeEnabled();
  });

  it('disables button after submit and input is cleared', async () => {
    render(<TaskForm onCreateTask={mockOnCreateTask} />);

    const input = screen.getByRole('textbox', { name: /task/i });
    const button = screen.getByRole('button', { name: /add task/i });

    await user.type(input, 'Task');
    await user.click(button);

    expect(button).toBeDisabled();
    expect(input).toHaveValue('');
  });

  it('handles long text input', async () => {
    render(<TaskForm onCreateTask={mockOnCreateTask} />);

    const input = screen.getByRole('textbox', { name: /task/i });
    const longText = 'A'.repeat(80);

    await user.type(input, longText);

    expect(input).toHaveValue(longText);
  });
});