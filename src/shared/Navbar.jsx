import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, HeartPulse } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { Button } from './Button';

/**
 * Clean, minimalistic top bar adhering to DESIGN.md
 * Left: "MediFlow" brand with clean outline icon
 * Right: Current role label & Logout button
 */
export function Navbar() {
  const { currentUser, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleLabels = {
    patient: 'Patient',
    receptionist: 'Receptionist',
    doctor: 'Doctor',
  };

  return (
    <header className="w-full bg-white border-b border-slate-200">
      <div className="max-w-content mx-auto px-4 sm:px-6 h-18 py-3.5 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-medicard border border-slate-200 flex items-center justify-center text-mediteal">
            <HeartPulse className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              MediFlow
            </span>
          </div>
        </div>

        {/* User Role & Logout */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <span className="hidden sm:inline text-sm text-slate-500">
              {currentUser?.displayName || currentUser?.email || 'Signed in as'}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-mediteal-light text-mediteal border border-mediteal/20 uppercase tracking-wide">
              {roleLabels[role] || role || 'User'}
            </span>
          </div>

          <Button
            variant="secondary"
            size="small"
            onClick={handleLogout}
            icon={LogOut}
            className="!min-h-[38px] text-xs sm:text-sm font-medium"
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
