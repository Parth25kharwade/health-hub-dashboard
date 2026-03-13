import api from "./api";

export const getIcuStatus = (hospitalId: string | number) => api.get(`/resources/icu/${hospitalId}`);
export const updateIcuBeds = (data: object) => api.put("/resources/icu", data);
export const updateStaffWorkload = (data: object) => api.put("/resources/staff", data);
export const predictResourceStress = (hospitalId: string | number) => api.post(`/resources/predict/${hospitalId}`, {});
export const getForecastHistory = (hospitalId: string | number) => api.get(`/resources/forecast/${hospitalId}`);
