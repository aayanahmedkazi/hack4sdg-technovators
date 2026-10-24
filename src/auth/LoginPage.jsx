import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  User,
  Users,
  Stethoscope,
  AlertCircle,
  LogIn,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  Clock,
  FileText,
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { isConfigured } from '../shared/firebase';
import { MediFlowLogo } from '../shared/Navbar';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState(null);

  const { loginWithEmail, demoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectUser = (userRole) => {
    const destination =
      location.state?.from?.pathname ||
      (userRole === 'doctor'
        ? '/doctor'
        : userRole === 'receptionist'
        ? '/receptionist'
        : '/patient');
    navigate(destination, { replace: true });
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const user = await loginWithEmail(email, password);
      let targetRole = 'patient';
      const emailLower = (email || '').toLowerCase();
      if (emailLower.includes('doctor')) targetRole = 'doctor';
      else if (emailLower.includes('reception')) targetRole = 'receptionist';

      redirectUser(user.role || targetRole);
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password'
          ? 'Incorrect email address or password.'
          : err.message || 'Could not sign in. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async (targetRole) => {
    setError('');
    setSubmitting(true);
    setSelectedDemo(targetRole);
    try {
      await demoLogin(targetRole);
      redirectUser(targetRole);
    } catch (err) {
      setError('Could not sign into demo role.');
      setSubmitting(false);
      setSelectedDemo(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EBF5F6] via-[#F4F9FA] to-[#E5EFF2] flex flex-col justify-center items-center px-4 py-10 sm:px-6 relative overflow-hidden">
      
      {/* Soft ambient decorative background orbs */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg mx-auto relative z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white border border-teal-100 shadow-sm mb-3.5">
            <MediFlowLogo className="w-11 h-11" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            MediFlow
          </h1>
          <p className="mt-1.5 text-sm sm:text-base text-slate-600 font-medium">
            Smart clinic queue and hospital flow management
          </p>
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-mediteal border border-teal-100">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Care in Every Step &bull; Outpatient Portal</span>
          </div>
        </div>

        {/* Elevated Glassmorphic Main Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 transition-all">
          
          {/* Quick Demo Logins Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <span>Quick Demo Logins</span>
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-bold">
                Instant Access
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              
              {/* Patient Demo Button */}
              <button
                type="button"
                onClick={() => handleDemoLogin('patient')}
                disabled={submitting}
                className={`w-full min-h-[58px] flex items-center justify-between px-4 py-3 bg-white hover:bg-teal-50/50 border border-slate-200 hover:border-mediteal/50 rounded-2xl transition-all text-left group shadow-sm hover:shadow ${
                  selectedDemo === 'patient' ? 'ring-2 ring-mediteal bg-teal-50/70' : ''
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0B5D5E] group-hover:scale-105 transition-transform shrink-0">
                    <User className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>Patient Demo</span>
                      <span className="text-[10px] font-semibold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded-full">
                        Outpatient
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                      Queue token, medicines & records
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-slate-400 group-hover:text-mediteal transition-colors">
                  <span className="text-xs font-semibold hidden sm:inline">Launch</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Receptionist Demo Button */}
              <button
                type="button"
                onClick={() => handleDemoLogin('receptionist')}
                disabled={submitting}
                className={`w-full min-h-[58px] flex items-center justify-between px-4 py-3 bg-white hover:bg-sky-50/50 border border-slate-200 hover:border-sky-400/50 rounded-2xl transition-all text-left group shadow-sm hover:shadow ${
                  selectedDemo === 'receptionist' ? 'ring-2 ring-sky-500 bg-sky-50/70' : ''
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 group-hover:scale-105 transition-transform shrink-0">
                    <Users className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>Receptionist Demo</span>
                      <span className="text-[10px] font-semibold text-sky-800 bg-sky-100/70 px-2 py-0.5 rounded-full">
                        Front Desk
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                      Issue tokens & register patients
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-slate-400 group-hover:text-sky-600 transition-colors">
                  <span className="text-xs font-semibold hidden sm:inline">Launch</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Doctor Demo Button */}
              <button
                type="button"
                onClick={() => handleDemoLogin('doctor')}
                disabled={submitting}
                className={`w-full min-h-[58px] flex items-center justify-between px-4 py-3 bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-400/50 rounded-2xl transition-all text-left group shadow-sm hover:shadow ${
                  selectedDemo === 'doctor' ? 'ring-2 ring-emerald-500 bg-emerald-50/70' : ''
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 group-hover:scale-105 transition-transform shrink-0">
                    <Stethoscope className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>Doctor Demo</span>
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                        Clinic Room
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                      Call patients & write prescriptions
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-slate-400 group-hover:text-emerald-700 transition-colors">
                  <span className="text-xs font-semibold hidden sm:inline">Launch</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

            </div>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400 font-bold tracking-wider">
                Or Sign In with Email
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-2.5 text-sm text-red-700 font-medium animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Demo Note Info */}
          {!isConfigured && (
            <div className="mb-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-start space-x-2.5 leading-relaxed">
              <span className="text-base leading-none">ℹ️</span>
              <span>
                Firebase keys are in demo mode. You can click any demo button above or sign in with your email.
              </span>
            </div>
          )}

          {/* Email Sign In Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 tracking-wide mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@hospital.com"
                  className="w-full min-h-[46px] pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-mediteal focus:ring-1 focus:ring-mediteal transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 tracking-wide mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full min-h-[46px] pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-mediteal focus:ring-1 focus:ring-mediteal transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#0B5D5E] hover:bg-[#08494A] active:scale-[0.99] text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center space-x-2.5 shadow-sm transition-all min-h-[48px] cursor-pointer disabled:opacity-50 mt-2"
            >
              <LogIn className="w-5 h-5 stroke-[2.2]" />
              <span className="text-base tracking-wide">
                {submitting ? 'Signing in...' : 'Sign In'}
              </span>
            </button>
          </form>

        </div>

        {/* Feature Badges Footer */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-500">
          <div className="flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-mediteal" />
            <span>Live Clinic Queues</span>
          </div>
          <span className="text-slate-300">&bull;</span>
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Smart Outpatient Triage</span>
          </div>
          <span className="text-slate-300">&bull;</span>
          <div className="flex items-center space-x-1.5">
            <FileText className="w-3.5 h-3.5 text-sky-600" />
            <span>Digital Prescriptions</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default LoginPage;
