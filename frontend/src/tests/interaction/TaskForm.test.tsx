import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskForm } from '../../components/TaskForm';
import { vi } from 'vitest';

describe('TaskForm - Interaction Tests', () => {
  const mockOnCreateTask = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    mockOnCreateTask.mockClear();
  });

  it('allows typing in the input field', async () => {
    render(<TaskForm onCreateTask={mockOnCreateTask} />);

    const input = screen.getByRole('textbox', { name: /task/i });
    await user.type(input, 'New task');

    expect(input).toHaveValue('New task');
  });

  it('calls onCreateTask and clears input on form submit', async () => {
    render(<TaskForm onCreateTask={mockOnCreateTask} />);

    const input = screen.getByRole('textbox', { name: /task/i });
    const button = screen.getByRole('button', { name: /add task/i });

    await user.type(input, 'New task');
    await user.click(button);

    expect(mockOnCreateTask).toHaveBeenCalledWith('New task');
    expect(input).toHaveValue('');
  });

  it('submits form when pressing Enter', async () => {
    render(<TaskForm onCreateTask={mockOnCreateTask} />);

    const input = screen.getByRole('textbox', { name: /task/i });

    await user.type(input, 'Task via Enter{enter}');

    expect(mockOnCreateTask).toHaveBeenCalledWith('Task via Enter');
    expect(input).toHaveValue('');
  });

  it('does not submit if input is only spaces', async () => {
    render(<TaskForm onCreateTask={mockOnCreateTask} />);

    const input = screen.getByRole('textbox', { name: /task/i });
    const button = screen.getByRole('button', { name: /add task/i });

    await user.type(input, '   ');
    await user.click(button);

    expect(mockOnCreateTask).not.toHaveBeenCalled();
    expect(input).toHaveValue('   ');
  });

  it('handles multiple submits correctly', async () => {
    render(<TaskForm onCreateTask={mockOnCreateTask} />);

    const input = screen.getByRole('textbox', { name: /task/i });
    const button = screen.getByRole('button', { name: /add task/i });

    await user.type(input, 'First task');
    await user.click(button);
    await user.type(input, 'Second task');
    await user.click(button);

    expect(mockOnCreateTask).toHaveBeenCalledTimes(2);
    expect(mockOnCreateTask).toHaveBeenNthCalledWith(1, 'First task');
    expect(mockOnCreateTask).toHaveBeenNthCalledWith(2, 'Second task');
  });

  it('supports keyboard navigation', async () => {
    render(<TaskForm onCreateTask={mockOnCreateTask} />);

    const input = screen.getByRole('textbox', { name: /task/i });
    const button = screen.getByRole('button', { name: /add task/i });

    input.focus();
    expect(input).toHaveFocus();

    // Mientras está deshabilitado, no debería poder recibir foco
    expect(button).toBeDisabled();
    button.focus();
    expect(button).not.toHaveFocus();

    // Al escribir una tarea, el botón se habilita y puede recibir foco
    await user.type(input, 'Task via keyboard');
    expect(button).toBeEnabled();

    button.focus();
    expect(button).toHaveFocus();
  });
});