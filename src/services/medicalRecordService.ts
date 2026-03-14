import api from "./api";

export interface MedicalRecordPayload {
  patientId: number;
  recordType: string;
  title: string;
  description: string;
  diagnosis: string;
  treatment: string;
  medications: string;
  visitDate: string;
}

export interface MedicalRecordResponse {
  id: number;
  patientId: number;
  patientName: string;
  recordType: string;
  title: string;
  description: string;
  diagnosis: string;
  treatment: string;
  medications: string;
  allergies: string | null;
  filePath: string | null;
  visitDate: string;
  doctorName: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export const createMedicalRecord = (data: MedicalRecordPayload) =>
  api.post<ApiResponse<MedicalRecordResponse>>("/patients/records", data);
