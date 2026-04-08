import { useFetch } from "./useFetch";
import { gradesService } from "../services/gradesService";

export function useGrades() {
  return useFetch(gradesService.list, []);
}
