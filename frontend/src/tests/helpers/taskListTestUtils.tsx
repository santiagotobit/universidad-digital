/**
 * Helpers para tests de TaskList — reducen duplicación de mocks y render.
 */
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { TaskList } from '../../components/TaskList';

export type TaskForTest = { id: number; text: string; completed: boolean };

export function createTaskListMocks() {
  return {
    onToggle: vi.fn(),
    onDelete: vi.fn(),
  };
}

export function renderTaskList(
  tasks: TaskForTest[],
  { onToggle, onDelete }: { onToggle: ReturnType<typeof vi.fn>; onDelete: ReturnType<typeof vi.fn> }
) {
  return render(<TaskList tasks={tasks} onToggle={onToggle} onDelete={onDelete} />);
}

export { screen };
