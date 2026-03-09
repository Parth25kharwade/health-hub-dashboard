import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
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
  return <Navigate to={user?.role === "DOCTOR" ? "/doctor/dashboard" : "/admin/dashboard"} replace />;
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
            <Route path="/doctor/dashboard" element={<ProtectedRoute allowedRoles={["DOCTOR"]}><DoctorDashboard /></ProtectedRoute>} />
            <Route path="/doctor/patients" element={<ProtectedRoute allowedRoles={["DOCTOR"]}><Patients /></ProtectedRoute>} />
            <Route path="/doctor/patients/:id" element={<ProtectedRoute allowedRoles={["DOCTOR"]}><PatientHistory /></ProtectedRoute>} />
            <Route path="/doctor/history" element={<ProtectedRoute allowedRoles={["DOCTOR"]}><PatientHistory /></ProtectedRoute>} />
            <Route path="/doctor/records/new" element={<ProtectedRoute allowedRoles={["DOCTOR"]}><CreateRecord /></ProtectedRoute>} />
            <Route path="/doctor/ai-diagnosis" element={<ProtectedRoute allowedRoles={["DOCTOR"]}><AIDiagnosis /></ProtectedRoute>} />
            <Route path="/doctor/alerts" element={<ProtectedRoute allowedRoles={["DOCTOR"]}><Alerts /></ProtectedRoute>} />

            {/* Admin routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/icu" element={<ProtectedRoute allowedRoles={["ADMIN"]}><IcuManagement /></ProtectedRoute>} />
            <Route path="/admin/staff" element={<ProtectedRoute allowedRoles={["ADMIN"]}><StaffManagement /></ProtectedRoute>} />
            <Route path="/admin/prediction" element={<ProtectedRoute allowedRoles={["ADMIN"]}><ResourcePrediction /></ProtectedRoute>} />
            <Route path="/admin/forecast" element={<ProtectedRoute allowedRoles={["ADMIN"]}><ForecastHistory /></ProtectedRoute>} />

            <Route path="/unauthorized" element={<div className="flex items-center justify-center h-screen"><p className="text-muted-foreground">Unauthorized access.</p></div>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
