import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { LoginPage } from './auth/LoginPage';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { PatientPortal } from './portals/patient/PatientPortal';
import { ReceptionistPortal } from './portals/receptionist/ReceptionistPortal';
import { DoctorPortal } from './portals/doctor/DoctorPortal';
import { DemoToolsPage } from './demo/DemoToolsPage';

function RootRedirect() {
  const { currentUser, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'doctor') return <Navigate to="/doctor" replace />;
  if (role === 'receptionist') return <Navigate to="/receptionist" replace />;
  return <Navigate to="/patient" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/demo-tools" element={<DemoToolsPage />} />

          {/* Role-protected Portals */}
          <Route
            path="/patient"
            element={
              <ProtectedRoute allowedRole="patient">
                <PatientPortal />
              </ProtectedRoute>
            }
          />

          <Route
            path="/receptionist"
            element={
              <ProtectedRoute allowedRole="receptionist">
                <ReceptionistPortal />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor"
            element={
              <ProtectedRoute allowedRole="doctor">
                <DoctorPortal />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor/prescribe"
            element={
              <ProtectedRoute allowedRole="doctor">
                <DoctorPortal />
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
