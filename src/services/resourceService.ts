import api from "./api";

export const getIcuStatus = (hospitalId: string) => api.get(`/resources/icu/${hospitalId}`);
export const updateIcuBeds = (data: object) => api.put("/resources/icu", data);
export const updateStaffWorkload = (data: object) => api.put("/resources/staff", data);
export const predictResourceStress = (hospitalId: string) => api.post(`/resources/predict/${hospitalId}`, {});
export const getForecastHistory = (hospitalId: string) => api.get(`/resources/forecast/${hospitalId}`);
