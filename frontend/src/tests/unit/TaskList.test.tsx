import { mockTasks, emptyTasks } from '../fixtures/tasks';
import { createTaskListMocks, renderTaskList, screen } from '../helpers/taskListTestUtils';

describe('TaskList - Unit Behavior Tests', () => {
  const { onToggle: mockOnToggle, onDelete: mockOnDelete } = createTaskListMocks();

  beforeEach(() => {
    mockOnToggle.mockClear();
    mockOnDelete.mockClear();
  });

  it('renders empty state when no tasks', () => {
    renderTaskList(emptyTasks, { onToggle: mockOnToggle, onDelete: mockOnDelete });
    expect(screen.getByText('No tasks yet.')).toBeInTheDocument();
  });

  it('renders list of tasks', () => {
    renderTaskList(mockTasks, { onToggle: mockOnToggle, onDelete: mockOnDelete });
    expect(screen.getByRole('list', { name: /task list/i })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('displays task text correctly', () => {
    renderTaskList(mockTasks, { onToggle: mockOnToggle, onDelete: mockOnDelete });
    expect(screen.getByText('Learn React')).toBeInTheDocument();
    expect(screen.getByText('Write tests')).toBeInTheDocument();
    expect(screen.getByText('Deploy app')).toBeInTheDocument();
  });

  it('has proper accessibility for checkboxes', () => {
    renderTaskList(mockTasks, { onToggle: mockOnToggle, onDelete: mockOnDelete });
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(3);
    expect(checkboxes[0]).toHaveAttribute('aria-label', 'Mark Learn React as complete');
  });

  it('completed task checkbox is checked', () => {
    renderTaskList(mockTasks, { onToggle: mockOnToggle, onDelete: mockOnDelete });
    const checkbox = screen.getByRole('checkbox', { name: /mark write tests as incomplete/i });
    expect(checkbox).toBeChecked();
  });

  it('incomplete task checkbox is not checked', () => {
    renderTaskList(mockTasks, { onToggle: mockOnToggle, onDelete: mockOnDelete });
    const checkbox = screen.getByRole('checkbox', { name: /mark learn react as complete/i });
    expect(checkbox).not.toBeChecked();
  });
});