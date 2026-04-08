import * as subjectsApi from "../api/subjects";

export const subjectsService = {
  list: subjectsApi.listSubjects,
  create: subjectsApi.createSubject,
  update: subjectsApi.updateSubject,
  deactivate: subjectsApi.deactivateSubject,
  activate: subjectsApi.activateSubject
};
