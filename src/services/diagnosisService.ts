import api from "./api";

export interface DiagnosisInput {
  patientId?: number;
  symptoms: string[];
  vitals: {
    temperature: number;
    systolicBp: number;
    diastolicBp: number;
    heartRate: number;
    oxygenSaturation: number;
    respiratoryRate?: number;
  };
  labReport: {
    hemoglobin?: number;
    plateletCount?: number;
    wbcCount?: number;
    bloodSugar?: number;
    creatinine?: number;
    bilirubin?: number;
    alt?: number;
    reportDate?: string;
  } | null;
}

export interface DiagnosisResult {
  patientId: number;
  patientName: string;
  riskScore: number;
  riskLevel: string;
  suspectedConditions: string[];
  diagnosticAlerts: string[];
  recommendations: string[];
  analyzedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export const analyzeDiagnosis = (data: DiagnosisInput) =>
  api.post<ApiResponse<DiagnosisResult>>("/diagnosis/analyze", data);

export const getDiagnosisAlerts = () => api.get("/diagnosis/alerts/doctor");

export interface DiagnosisHistoryItem {
  id: number;
  patientId: number;
  patientName: string;
  riskScore: number;
  riskLevel: string;
  suspectedConditions: string;
  diagnosticAlerts: string;
  recommendations: string;
  analyzedAt: string;
}

export const getDiagnosisHistory = (patientId: string | number) =>
  api.get<ApiResponse<DiagnosisHistoryItem[]>>(`/diagnosis/patient/${patientId}/history`);

// --- Gemini AI Lab Report Explainer ---
export interface ExplainLabInput {
  patientId: number;
  labReport: {
    hemoglobin?: number;
    plateletCount?: number;
    whiteBloodCellCount?: number;
    bloodSugar?: number;
    cholesterol?: number;
  };
}

export const explainLabReport = (data: ExplainLabInput) =>
  api.post<string>("/ai/explain-lab", data);
