import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ResourceProvider } from "@/context/ResourceContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Auth
import Login from "@/pages/Login";
import Register from "@/pages/Register";

// Doctor pages
import DoctorDashboard from "@/pages/doctor/DoctorDashboard";
import Patients from "@/pages/doctor/Patients";
import PatientHistory from "@/pages/doctor/PatientHistory";
import CreateRecord from "@/pages/doctor/CreateRecord";
import AIDiagnosis from "@/pages/doctor/AIDiagnosis";
import GeminiAnalysis from "@/pages/doctor/GeminiAnalysis";
import Alerts from "@/pages/doctor/Alerts";

// Admin pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import IcuManagement from "@/pages/admin/IcuManagement";
import StaffManagement from "@/pages/admin/StaffManagement";
import ResourcePrediction from "@/pages/admin/ResourcePrediction";
import ForecastHistory from "@/pages/admin/ForecastHistory";

import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const RootRedirect = () => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={user?.role === "ROLE_DOCTOR" ? "/doctor/dashboard" : "/admin/dashboard"} replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<RootRedirect />} />

            {/* Doctor routes */}
            <Route path="/doctor/dashboard" element={<ProtectedRoute allowedRoles={["ROLE_DOCTOR"]}><DoctorDashboard /></ProtectedRoute>} />
            <Route path="/doctor/patients" element={<ProtectedRoute allowedRoles={["ROLE_DOCTOR"]}><Patients /></ProtectedRoute>} />
            <Route path="/doctor/patients/:id" element={<ProtectedRoute allowedRoles={["ROLE_DOCTOR"]}><PatientHistory /></ProtectedRoute>} />
            <Route path="/doctor/history" element={<ProtectedRoute allowedRoles={["ROLE_DOCTOR"]}><PatientHistory /></ProtectedRoute>} />
            <Route path="/doctor/records/new" element={<ProtectedRoute allowedRoles={["ROLE_DOCTOR"]}><CreateRecord /></ProtectedRoute>} />
            <Route path="/doctor/ai-diagnosis" element={<ProtectedRoute allowedRoles={["ROLE_DOCTOR"]}><AIDiagnosis /></ProtectedRoute>} />
            <Route path="/doctor/gemini-ai" element={<ProtectedRoute allowedRoles={["ROLE_DOCTOR"]}><GeminiAnalysis /></ProtectedRoute>} />
            <Route path="/doctor/alerts" element={<ProtectedRoute allowedRoles={["ROLE_DOCTOR"]}><Alerts /></ProtectedRoute>} />

            {/* Admin routes — all wrapped in ResourceProvider for shared live staff state */}
            <Route path="/admin/*" element={
              <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
                <ResourceProvider>
                  <Routes>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="icu" element={<IcuManagement />} />
                    <Route path="staff" element={<StaffManagement />} />
                    <Route path="prediction" element={<ResourcePrediction />} />
                    <Route path="forecast" element={<ForecastHistory />} />
                  </Routes>
                </ResourceProvider>
              </ProtectedRoute>
            } />

            <Route path="/unauthorized" element={
              <div className="flex flex-col items-center justify-center h-screen gap-4">
                <p className="text-muted-foreground text-lg">Unauthorized access.</p>
                <p className="text-muted-foreground text-sm">You don't have permission to view this page.</p>
                <div className="flex gap-3">
                  <a href="/login" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition">Go to Login</a>
                  <button onClick={() => window.history.back()} className="px-4 py-2 rounded-lg border border-border hover:bg-accent transition">Go Back</button>
                </div>
              </div>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
