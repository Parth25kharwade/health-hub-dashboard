import api from "./api";

export interface DiagnosisInput {
  symptoms: string[];
  vitals: { temperature: number; systolicBp: number; diastolicBp: number; heartRate: number; oxygenSaturation: number };
  labReport: { plateletCount: number; hemoglobin: number; bloodSugar: number; wbcCount: number };
  patientId?: string;
}

export const analyzeDiagnosis = (data: DiagnosisInput) => api.post("/diagnosis/analyze", data);
export const getDiagnosisAlerts = () => api.get("/diagnosis/alerts/doctor");
export const getDiagnosisHistory = (patientId: string) => api.get(`/diagnosis/patient/${patientId}/history`);
