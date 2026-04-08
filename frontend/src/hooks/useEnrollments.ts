import { useFetch } from "./useFetch";
import { enrollmentsService } from "../services/enrollmentsService";

export function useEnrollments() {
  return useFetch(enrollmentsService.list, []);
}
