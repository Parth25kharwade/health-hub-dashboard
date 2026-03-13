import api from "./api";

export const getDoctorDashboard = () => api.get("/dashboard/doctor");
export const getAdminDashboard = (hospitalId: string | number) => api.get(`/dashboard/admin/${hospitalId}`);
