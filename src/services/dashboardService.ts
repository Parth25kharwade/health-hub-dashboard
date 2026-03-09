import api from "./api";

export const getDoctorDashboard = () => api.get("/dashboard/doctor");
export const getAdminDashboard = (hospitalId: string) => api.get(`/dashboard/admin/${hospitalId}`);
