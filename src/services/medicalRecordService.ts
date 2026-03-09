import api from "./api";

export interface MedicalRecord {
  patientId: string; recordType: string; title: string;
  description: string; diagnosis: string; treatment: string;
  medications: string; visitDate: string;
}

export const createMedicalRecord = (data: MedicalRecord) => api.post("/patients/records", data);
