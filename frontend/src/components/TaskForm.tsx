import React, { useState } from 'react';

interface TaskFormProps {
  onCreateTask: (task: string) => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onCreateTask }) => {
  const [task, setTask] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (task.trim()) {
      onCreateTask(task.trim());
      setTask('');
    }
  };

  return (
    <form onSubmit={handleSubmit} role="form" aria-label="Create task form">
      <label htmlFor="task-input">Task:</label>
      <input
        id="task-input"
        type="text"
        value={task}
        onChange={(e) => setTask(e.target.value)}
        placeholder="Enter a task"
        aria-describedby="task-help"
      />
      <span id="task-help">Enter the task description</span>
      <button type="submit" disabled={!task.trim()}>
        Add Task
      </button>
    </form>
  );
};