import * as enrollmentsApi from "../api/enrollments";

export const enrollmentsService = {
  list: enrollmentsApi.listEnrollments,
  create: enrollmentsApi.createEnrollment,
  update: enrollmentsApi.updateEnrollment,
  deactivate: enrollmentsApi.deactivateEnrollment,
  activate: enrollmentsApi.activateEnrollment
};
