import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  Home,
  Ticket,
  Calendar,
  FileText,
  User,
  ChevronDown,
  Check,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { Button } from './Button';

/**
 * MediFlow Cross Logo matching the screenshot design:
 * Rounded cross icon with vibrant teal/emerald medical colors.
 */
export function MediFlowLogo({ className = 'w-9 h-9' }) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Vertical bar */}
      <rect x="13" y="2" width="10" height="32" rx="5" fill="#0B5D5E" />
      {/* Horizontal bar */}
      <rect x="2" y="13" width="32" height="10" rx="5" fill="#2DD4BF" opacity="0.9" />
      {/* Center overlap blend */}
      <rect x="13" y="13" width="10" height="10" rx="2.5" fill="#0D9488" />
    </svg>
  );
}

/**
 * Clean, minimalistic top bar adhering to DESIGN.md and patient screenshot
 */
export function Navbar({
  activeNav = 'queue',
  onNavChange,
  navLinks,
  showPatientNav = false,
}) {
  const { currentUser, role, logout } = useAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleLabels = {
    patient: 'Patient',
    receptionist: 'Receptionist',
    doctor: 'Doctor',
  };

  const defaultPatientLinks = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'queue', label: 'Queue', icon: Ticket },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'prescriptions', label: 'Prescriptions', icon: FileText },
  ];

  const links = navLinks || (showPatientNav || role === 'patient' ? defaultPatientLinks : null);

  // Display user name
  const displayName = currentUser?.displayName
    ? currentUser.displayName.replace(/\s*\([^)]*\)/, '')
    : 'Aarav Sharma';

  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 py-2.5 flex items-center justify-between">
        
        {/* Brand: Logo + MediFlow + Tagline */}
        <div
          className="flex items-center space-x-3 cursor-pointer select-none"
          onClick={() => onNavChange && onNavChange('queue')}
        >
          <MediFlowLogo className="w-9 h-9 shrink-0" />
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-none">
              MediFlow
            </span>
            <span className="text-[11px] text-slate-500 font-medium tracking-tight mt-0.5">
              Care in Every Step
            </span>
          </div>
        </div>

        {/* Center Navigation Links (shown on patient portal or when links provided) */}
        {links && (
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-4">
            {links.map((link) => {
              const isActive = activeNav === link.id;
              const Icon = link.icon;
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => onNavChange && onNavChange(link.id)}
                  className={`relative flex items-center space-x-2 px-3 py-4 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'text-mediteal'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {Icon && (
                    <Icon
                      className={`w-4 h-4 stroke-[2.2] ${
                        isActive ? 'text-mediteal' : 'text-slate-500'
                      }`}
                    />
                  )}
                  <span>{link.label}</span>

                  {/* Active Green/Teal Line Indicator underneath */}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-[3px] bg-[#0B5D5E] rounded-t-full" />
                  )}
                </button>
              );
            })}
          </nav>
        )}

        {/* Right Section: User Profile Pill with Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center space-x-2 p-1.5 px-3 rounded-full hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 select-none"
          >
            <div className="w-8 h-8 rounded-full bg-mediteal-light border border-mediteal/30 flex items-center justify-center text-mediteal">
              <User className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="text-sm font-bold text-slate-800">
              {displayName}
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* User Menu Dropdown */}
          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs text-slate-500">Signed in as</p>
                <p className="text-sm font-bold text-slate-900 truncate">
                  {currentUser?.email || 'patient@mediflow.local'}
                </p>
                <div className="mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-mediteal-light text-mediteal border border-mediteal/20 uppercase tracking-wide">
                    {roleLabels[role] || role || 'Patient'}
                  </span>
                </div>
              </div>

              {/* Mobile Navigation Links if screen is small */}
              {links && (
                <div className="md:hidden py-1 border-b border-slate-100">
                  {links.map((link) => (
                    <button
                      key={link.id}
                      type="button"
                      onClick={() => {
                        if (onNavChange) onNavChange(link.id);
                        setUserMenuOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-xs font-semibold flex items-center justify-between ${
                        activeNav === link.id
                          ? 'bg-mediteal-light text-mediteal'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{link.label}</span>
                      {activeNav === link.id && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}

              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-xs font-semibold text-medicoral hover:bg-medicoral-light/50 flex items-center space-x-2 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}

export default Navbar;
