import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HeartPulse, ArrowRight, User, Users, Stethoscope, AlertCircle, LogIn } from 'lucide-react';
import { useAuth } from './AuthContext';
import { isConfigured } from '../shared/firebase';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { loginWithEmail, demoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectUser = (userRole) => {
    const destination = location.state?.from?.pathname || (
      userRole === 'doctor'
        ? '/doctor'
        : userRole === 'receptionist'
        ? '/receptionist'
        : '/patient'
    );
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
    try {
      await demoLogin(targetRole);
      redirectUser(targetRole);
    } catch (err) {
      setError('Could not sign into demo role.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center px-4 py-12 sm:px-6">
      <div className="w-full max-w-md mx-auto">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-medicard border border-slate-200 text-mediteal mb-4">
            <HeartPulse className="w-8 h-8 stroke-[2]" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            MediFlow
          </h1>
          <p className="mt-1.5 text-base text-slate-600">
            Smart clinic queue and hospital flow management
          </p>
        </div>

        {/* Login Card */}
        <Card className="p-6 sm:p-8">
          
          {/* Quick Demo Switcher */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Quick Demo Logins
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-mediteal-light text-mediteal font-semibold">
                Instant Access
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              <button
                type="button"
                onClick={() => handleDemoLogin('patient')}
                disabled={submitting}
                className="w-full min-h-[50px] flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-medicard flex items-center justify-center text-mediteal">
                    <User className="w-4 h-4 stroke-[2]" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">Patient Demo</div>
                    <div className="text-xs text-slate-500">Queue token, medicines & records</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-mediteal group-hover:translate-x-0.5 transition" />
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('receptionist')}
                disabled={submitting}
                className="w-full min-h-[50px] flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-medicard flex items-center justify-center text-mediteal">
                    <Users className="w-4 h-4 stroke-[2]" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">Receptionist Demo</div>
                    <div className="text-xs text-slate-500">Issue tokens & register patients</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-mediteal group-hover:translate-x-0.5 transition" />
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('doctor')}
                disabled={submitting}
                className="w-full min-h-[50px] flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-medicard flex items-center justify-center text-mediteal">
                    <Stethoscope className="w-4 h-4 stroke-[2]" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">Doctor Demo</div>
                    <div className="text-xs text-slate-500">Call patients & write prescriptions</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-mediteal group-hover:translate-x-0.5 transition" />
              </button>
            </div>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-medicard px-2 text-slate-400 font-semibold tracking-wider">
                Or Sign In with Email
              </span>
            </div>
          </div>

          {/* Error Message using Coral */}
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-medicoral-light border border-medicoral/25 flex items-start space-x-2.5 text-sm text-medicoral font-medium">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!isConfigured && (
            <div className="mb-4 p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-600">
              ℹ️ Firebase keys are in demo mode. You can click any demo button above or type any email.
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@hospital.com"
                className="w-full min-h-[46px] px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-base text-slate-900 focus:outline-none focus:border-mediteal focus:ring-1 focus:ring-mediteal transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full min-h-[46px] px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-base text-slate-900 focus:outline-none focus:border-mediteal focus:ring-1 focus:ring-mediteal transition"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="large"
              fullWidth
              disabled={submitting}
              icon={LogIn}
            >
              {submitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
