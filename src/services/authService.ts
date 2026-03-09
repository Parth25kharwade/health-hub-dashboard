import api from "./api";

export interface LoginPayload { username: string; password: string }
export interface RegisterPayload {
  username: string; password: string; email: string;
  fullName: string; role: "DOCTOR" | "ADMIN"; hospitalId?: string;
}
export interface AuthResponse { token: string; role: string; userId: string; username: string; hospitalId?: string }

export const login = (data: LoginPayload) => api.post<AuthResponse>("/auth/login", data);
export const register = (data: RegisterPayload) => api.post<AuthResponse>("/auth/register", data);
