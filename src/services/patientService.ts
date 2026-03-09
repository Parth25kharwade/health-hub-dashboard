import api from "./api";

export interface Patient {
  id?: string; firstName: string; lastName: string; gender: string;
  age: number; phone: string; emergencyContact: string; doctorId?: string;
}

export const createPatient = (data: Patient) => api.post("/patients", data);
export const getPatientById = (id: string) => api.get(`/patients/${id}`);
export const getPatientsByDoctor = (doctorId: string) => api.get(`/patients/doctor/${doctorId}`);
export const updatePatient = (id: string, data: Partial<Patient>) => api.put(`/patients/${id}`, data);
export const getPatientHistory = (id: string) => api.get(`/patients/${id}/history`);
