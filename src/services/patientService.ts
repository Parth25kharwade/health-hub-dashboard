import api from "./api";

export interface Patient {
  id?: string | number;
  patientCode?: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  phone: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  doctorId?: string | number;
  doctorName?: string;
  hospitalId?: string | number;
  hospitalName?: string;
  isActive?: boolean;
  createdAt?: string;
}

export const createPatient = (data: Omit<Patient, 'id' | 'patientCode' | 'doctorName' | 'hospitalName' | 'isActive' | 'createdAt'>) => api.post("/patients", data);
export const getPatientById = (id: string | number) => api.get(`/patients/${id}`);
export const getPatientsByDoctor = (doctorId: string | number) => api.get(`/patients/doctor/${doctorId}`);
export const updatePatient = (id: string | number, data: Partial<Patient>) => api.put(`/patients/${id}`, data);
export const getPatientHistory = (id: string | number) => api.get(`/patients/${id}/history`);
