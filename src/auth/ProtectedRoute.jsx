import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function ProtectedRoute({ allowedRole, children }) {
  const { currentUser, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 font-medium">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Not logged in -> send to login page
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in, but wrong role -> block user and redirect to their assigned portal
  if (allowedRole && role !== allowedRole) {
    const userPortal = role === 'doctor'
      ? '/doctor'
      : role === 'receptionist'
      ? '/receptionist'
      : '/patient';

    return <Navigate to={userPortal} replace />;
  }

  return children;
}
