import { render, screen } from '@testing-library/react';
import { TaskForm } from '../../components/TaskForm';
import { vi } from 'vitest';

describe('TaskForm - Unit Behavior Tests', () => {
  const mockOnCreateTask = vi.fn();

  beforeEach(() => {
    mockOnCreateTask.mockClear();
  });

  it('renders the form with input and button', () => {
    render(<TaskForm onCreateTask={mockOnCreateTask} />);

    expect(screen.getByRole('textbox', { name: /task/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument();
  });

  it('displays the correct placeholder text', () => {
    render(<TaskForm onCreateTask={mockOnCreateTask} />);

    const input = screen.getByPlaceholderText('Enter a task');
    expect(input).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<TaskForm onCreateTask={mockOnCreateTask} />);

    const form = screen.getByRole('form', { name: /create task form/i });
    expect(form).toBeInTheDocument();

    const input = screen.getByLabelText('Task:');
    expect(input).toHaveAttribute('aria-describedby', 'task-help');
  });

  it('button is disabled when input is empty', () => {
    render(<TaskForm onCreateTask={mockOnCreateTask} />);

    const button = screen.getByRole('button', { name: /add task/i });
    expect(button).toBeDisabled();
  });
});