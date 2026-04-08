import * as gradesApi from "../api/grades";

export const gradesService = {
  list: gradesApi.listGrades,
  create: gradesApi.createGrade,
  update: gradesApi.updateGrade
};
