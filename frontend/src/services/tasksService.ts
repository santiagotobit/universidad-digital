import * as tasksApi from "../api/tasks";

export const tasksService = {
  list: tasksApi.listTasks,
  get: tasksApi.getTask,
  create: tasksApi.createTask,
  update: tasksApi.updateTask,
};
