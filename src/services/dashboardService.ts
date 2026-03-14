import api from "./api";

export interface DoctorDashboardData {
  totalActivePatients: number;
  highRiskCount: number;
  totalCriticalAlerts: number;
  criticalAlerts: any[];
  criticalCount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export const getDoctorDashboard = () => api.get<ApiResponse<DoctorDashboardData>>("/dashboard/doctor");
export const getAdminDashboard = (hospitalId: string | number) => api.get(`/dashboard/admin/${hospitalId}`);
