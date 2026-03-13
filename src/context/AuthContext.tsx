import React, { createContext, useContext, useState, ReactNode } from "react";

interface User {
  userId: number;
  fullName: string;
  email: string;
  role: string;
  hospitalId?: number;
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isDoctor: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("user");
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      // Clear stale sessions that have old role format (e.g. "DOCTOR" instead of "ROLE_DOCTOR")
      if (parsed?.role && !parsed.role.startsWith("ROLE_")) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  });

  const login = (userData: User) => {
    localStorage.setItem("token", userData.token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user, login, logout,
      isAuthenticated: !!user,
      isDoctor: user?.role === "ROLE_DOCTOR",
      isAdmin: user?.role === "ROLE_ADMIN",
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
