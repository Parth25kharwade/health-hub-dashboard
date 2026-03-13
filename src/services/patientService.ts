import api from "./api";

export interface Patient {
  id?: string | number; firstName: string; lastName: string; gender: string;
  age: number; phone: string; emergencyContact: string; doctorId?: string | number;
}

export const createPatient = (data: Patient) => api.post("/patients", data);
export const getPatientById = (id: string | number) => api.get(`/patients/${id}`);
export const getPatientsByDoctor = (doctorId: string | number) => api.get(`/patients/doctor/${doctorId}`);
export const updatePatient = (id: string | number, data: Partial<Patient>) => api.put(`/patients/${id}`, data);
export const getPatientHistory = (id: string | number) => api.get(`/patients/${id}/history`);
