import userEvent from '@testing-library/user-event';
import { mockTasks } from '../fixtures/tasks';
import { createTaskListMocks, renderTaskList, screen } from '../helpers/taskListTestUtils';

describe('TaskList - Interaction Tests', () => {
  const { onToggle: mockOnToggle, onDelete: mockOnDelete } = createTaskListMocks();
  const user = userEvent.setup();

  beforeEach(() => {
    mockOnToggle.mockClear();
    mockOnDelete.mockClear();
  });

  it('calls onToggle when checkbox is clicked', async () => {
    renderTaskList(mockTasks, { onToggle: mockOnToggle, onDelete: mockOnDelete });
    const checkbox = screen.getByRole('checkbox', { name: /mark learn react as complete/i });
    await user.click(checkbox);
    expect(mockOnToggle).toHaveBeenCalledWith(1);
  });

  it('calls onDelete when delete button is clicked', async () => {
    renderTaskList(mockTasks, { onToggle: mockOnToggle, onDelete: mockOnDelete });
    const deleteButton = screen.getByRole('button', { name: /delete learn react/i });
    await user.click(deleteButton);
    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });

  it('toggles multiple tasks independently', async () => {
    renderTaskList(mockTasks, { onToggle: mockOnToggle, onDelete: mockOnDelete });
    const checkbox1 = screen.getByRole('checkbox', { name: /mark learn react as complete/i });
    const checkbox2 = screen.getByRole('checkbox', { name: /mark write tests as incomplete/i });
    await user.click(checkbox1);
    await user.click(checkbox2);
    expect(mockOnToggle).toHaveBeenCalledTimes(2);
    expect(mockOnToggle).toHaveBeenNthCalledWith(1, 1);
    expect(mockOnToggle).toHaveBeenNthCalledWith(2, 2);
  });

  it('allows tab navigation to checkboxes', async () => {
    renderTaskList(mockTasks, { onToggle: mockOnToggle, onDelete: mockOnDelete });
    await user.tab();
    expect(screen.getByRole('checkbox', { name: /mark learn react as complete/i })).toHaveFocus();
  });
});