import { http } from "../api/http";
import { getErrorMessage, getStatusCode } from "../utils/apiError";

export interface DashboardStats {
  total_users: number;
  total_subjects: number;
  total_periods: number;
  total_enrollments: number;
  total_grades: number;
  active_periods: number;
  recent_users?: Array<{
    id: string;
    email: string;
    roles: string[];
  }>;
}

export interface StudentStats {
  total_enrollments: number;
  total_grades: number;
  average_grade: number | null;
  current_subjects: number;
}

export interface TeacherStats {
  total_students: number;
  total_subjects: number;
  pending_grades: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const response = await http.get<DashboardStats>("/admin/stats");
    return response.data;
  } catch (error) {
    const statusCode = getStatusCode(error);
    const message = getErrorMessage(error);
    
    const err = new Error(message) as any;
    err.response = { status: statusCode };
    throw err;
  }
}

export async function getStudentStats(): Promise<StudentStats> {
  try {
    const response = await http.get<StudentStats>("/admin/student/stats");
    return response.data;
  } catch (error) {
    const statusCode = getStatusCode(error);
    const message = getErrorMessage(error);
    
    const err = new Error(message) as any;
    err.response = { status: statusCode };
    throw err;
  }
}

export async function getTeacherStats(): Promise<TeacherStats> {
  try {
    const response = await http.get<TeacherStats>("/admin/teacher/stats");
    return response.data;
  } catch (error) {
    const statusCode = getStatusCode(error);
    const message = getErrorMessage(error);
    
    const err = new Error(message) as any;
    err.response = { status: statusCode };
    throw err;
  }
}
