import { useFetch } from "./useFetch";
import { subjectsService } from "../services/subjectsService";

export function useSubjects() {
  return useFetch(subjectsService.list, []);
}
