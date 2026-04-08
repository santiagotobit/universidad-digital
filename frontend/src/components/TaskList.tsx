import React from 'react';

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onToggle, onDelete }) => {
  if (tasks.length === 0) {
    return <p>No tasks yet.</p>;
  }

  return (
    <ul role="list" aria-label="Task list">
      {tasks.map((task) => (
        <li key={task.id} role="listitem">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggle(task.id)}
            aria-label={`Mark ${task.text} as ${task.completed ? 'incomplete' : 'complete'}`}
          />
          <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
            {task.text}
          </span>
          <button onClick={() => onDelete(task.id)} aria-label={`Delete ${task.text}`}>
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
};