import api from "./api";

export interface LoginPayload { email: string; password: string }

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  specialization?: string;
  hospitalId: number;
  role: "ROLE_DOCTOR" | "ROLE_ADMIN";
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: number;
  fullName: string;
  email: string;
  role: string;
  hospitalId: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export const login = (data: LoginPayload) =>
  api.post<ApiResponse<AuthResponse>>("/auth/login", data);

export const register = (data: RegisterPayload) =>
  api.post<ApiResponse<AuthResponse>>("/auth/register", data);
