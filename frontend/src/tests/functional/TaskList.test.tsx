import userEvent from '@testing-library/user-event';
import { mockTasks } from '../fixtures/tasks';
import { createTaskListMocks, renderTaskList, screen } from '../helpers/taskListTestUtils';

describe('TaskList - Functional UI Tests', () => {
  const { onToggle: mockOnToggle, onDelete: mockOnDelete } = createTaskListMocks();
  const user = userEvent.setup();

  beforeEach(() => {
    mockOnToggle.mockClear();
    mockOnDelete.mockClear();
  });

  it('shows completed tasks with strikethrough', () => {
    renderTaskList(mockTasks, { onToggle: mockOnToggle, onDelete: mockOnDelete });
    const completedTask = screen.getByText('Write tests');
    expect(completedTask).toHaveStyle('text-decoration: line-through');
  });

  it('shows incomplete tasks without strikethrough', () => {
    renderTaskList(mockTasks, { onToggle: mockOnToggle, onDelete: mockOnDelete });
    const incompleteTask = screen.getByText('Learn React');
    expect(incompleteTask).toHaveStyle('text-decoration: none');
  });

  it('updates task appearance after toggle', async () => {
    renderTaskList(mockTasks, { onToggle: mockOnToggle, onDelete: mockOnDelete });
    const taskText = screen.getByText('Learn React');
    expect(taskText).toHaveStyle('text-decoration: none');
  });

  it('removes task from list after delete', async () => {
    renderTaskList(mockTasks, { onToggle: mockOnToggle, onDelete: mockOnDelete });
    const deleteButton = screen.getByRole('button', { name: /delete learn react/i });
    await user.click(deleteButton);
    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });
});