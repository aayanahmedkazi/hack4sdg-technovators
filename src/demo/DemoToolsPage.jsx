import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Database,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Building2,
  Stethoscope,
  Users,
  FileText,
  Smartphone,
  MessageSquare,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Sparkles,
  Ticket,
} from 'lucide-react';
import { Button } from '../shared/Button';
import { Card } from '../shared/Card';
import { StatusBadge } from '../shared/StatusBadge';
import { PageHeader } from '../shared/PageHeader';
import { isConfigured } from '../shared/firebase';
import { useAuth } from '../auth/AuthContext';
import { seedDemoData, resetDemoData, DEMO_DATA } from './seedDemoData';

export function DemoToolsPage() {
  const [loadingAction, setLoadingAction] = useState(null); // 'seed' | 'reset' | null
  const [resultMessage, setResultMessage] = useState(null);
  const [resultType, setResultType] = useState(null); // 'success' | 'error' | 'info'
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const { demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleLoadDemoData = async () => {
    setLoadingAction('seed');
    setResultMessage(null);
    try {
      const res = await seedDemoData();
      if (res.success) {
        setResultType('success');
        setResultMessage(res.message);
      } else {
        setResultType('error');
        setResultMessage(res.message || res.error || 'Failed to seed demo data.');
      }
    } catch (err) {
      setResultType('error');
      setResultMessage(`Error: ${err.message || 'Unexpected failure while seeding data.'}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleResetDemoData = async () => {
    setShowConfirmReset(false);
    setLoadingAction('reset');
    setResultMessage(null);
    try {
      const res = await resetDemoData();
      if (res.success) {
        setResultType('info');
        setResultMessage(res.message);
      } else {
        setResultType('error');
        setResultMessage(res.message || res.error || 'Failed to reset demo data.');
      }
    } catch (err) {
      setResultType('error');
      setResultMessage(`Error: ${err.message || 'Unexpected failure while resetting data.'}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleQuickLogin = async (role, path) => {
    try {
      await demoLogin(role);
      navigate(path);
    } catch (err) {
      console.error('Quick login failed:', err);
    }
  };

  const nonSmartphoneCount = DEMO_DATA.patients.filter((p) => !p.hasSmartphone).length;
  const smartphoneCount = DEMO_DATA.patients.filter((p) => p.hasSmartphone).length;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Header */}
      <header className="w-full bg-white border-b border-slate-200">
        <div className="max-w-content mx-auto px-4 sm:px-6 h-18 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-medicard transition"
              title="Back to Login"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2]" />
            </Link>
            <div>
              <span className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                MediFlow
              </span>
              <span className="ml-2.5 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                Demo Tools
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <StatusBadge variant={isConfigured ? 'teal' : 'neutral'}>
              {isConfigured ? 'Firestore Live' : 'Demo Local Mode'}
            </StatusBadge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-content mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Page Title */}
        <PageHeader
          title="Demo Data & System Tools"
          subtitle="One-click seed and reset tools to populate Firestore and local demo stores with realistic outpatient hospital data."
        />

        {/* System Environment Status Card */}
        <Card className="!bg-slate-50 border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isConfigured ? 'bg-mediteal-light text-mediteal' : 'bg-slate-200 text-slate-600'}`}>
                <ShieldCheck className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {isConfigured ? 'Firebase Firestore Connected' : 'Running in Offline Demo Mode'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  {isConfigured
                    ? 'Actions directly read and write live collections in your configured Firebase project.'
                    : 'Firebase keys in .env are absent or placeholders. Seeding operates via persistent browser memory.'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Primary Action Buttons Card */}
        <Card className="border-2 border-slate-200">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Firestore Data Controls
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Fills or clears Firestore with data matching <code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-xs font-mono">DATA_MODEL.md</code>: 1 hospital ("City Care Hospital") plus a second hospital, 2 doctors, 10 patients (with non-smartphone cases), multiple prescriptions & reports, today's queues, and demo users.
              </p>
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button
                variant="primary"
                size="large"
                icon={Database}
                onClick={handleLoadDemoData}
                disabled={loadingAction !== null}
                className="flex-1 !py-3.5 !text-base"
              >
                {loadingAction === 'seed' ? 'Loading Demo Data...' : 'Load demo data'}
              </Button>

              {!showConfirmReset ? (
                <Button
                  variant="danger"
                  size="large"
                  icon={RotateCcw}
                  onClick={() => setShowConfirmReset(true)}
                  disabled={loadingAction !== null}
                  className="flex-1 !py-3.5 !text-base"
                >
                  Reset demo data
                </Button>
              ) : (
                <div className="flex-1 flex items-center gap-2">
                  <Button
                    variant="danger"
                    size="large"
                    icon={RotateCcw}
                    onClick={handleResetDemoData}
                    disabled={loadingAction !== null}
                    className="flex-1 !py-3.5 !text-base font-bold"
                  >
                    Confirm Reset
                  </Button>
                  <Button
                    variant="secondary"
                    size="large"
                    onClick={() => setShowConfirmReset(false)}
                    disabled={loadingAction !== null}
                    className="!py-3.5 text-sm"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            {/* Feedback Alert Banner */}
            {resultMessage && (
              <div
                className={`p-4 rounded-xl border flex items-start space-x-3 transition-all ${
                  resultType === 'success'
                    ? 'bg-mediteal-light/50 border-mediteal/30 text-mediteal'
                    : resultType === 'error'
                    ? 'bg-medicoral-light border-medicoral/30 text-medicoral'
                    : 'bg-slate-100 border-slate-300 text-slate-800'
                }`}
              >
                {resultType === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 stroke-[2]" />}
                {resultType === 'error' && <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 stroke-[2]" />}
                {resultType === 'info' && <RotateCcw className="w-5 h-5 shrink-0 mt-0.5 stroke-[2]" />}
                <div className="text-sm">
                  <p className="font-semibold">{resultMessage}</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Quick Portal Switcher */}
        <Card>
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-mediteal stroke-[2]" />
              Quick Jump to Role Portals
            </h3>
            <p className="text-sm text-slate-600">
              Jump straight into any portal with preloaded demo accounts to inspect the seeded records, prescriptions, and live queues:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleQuickLogin('patient', '/patient')}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-mediteal hover:bg-mediteal-light/20 transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-mediteal">
                    Patient Portal
                  </span>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-mediteal transition" />
                </div>
                <div className="font-bold text-slate-900">Aarav Sharma</div>
                <div className="text-xs text-slate-500 mt-1">Has full past prescriptions & reports</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('receptionist', '/receptionist')}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-mediteal hover:bg-mediteal-light/20 transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-mediteal">
                    Receptionist
                  </span>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-mediteal transition" />
                </div>
                <div className="font-bold text-slate-900">Priya Patel</div>
                <div className="text-xs text-slate-500 mt-1">Issue tokens & search 10 patients</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('doctor', '/doctor')}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-mediteal hover:bg-mediteal-light/20 transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-mediteal">
                    Doctor Portal
                  </span>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-mediteal transition" />
                </div>
                <div className="font-bold text-slate-900">Dr. Sameer Khan</div>
                <div className="text-xs text-slate-500 mt-1">Cardiology room with active queue</div>
              </button>
            </div>
          </div>
        </Card>

        {/* Dataset Breakdown / Summary */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900">
            Sample Dataset Specifications (DATA_MODEL.md)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Hospitals & Doctors */}
            <Card>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-mediteal-light text-mediteal flex items-center justify-center">
                  <Building2 className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Hospitals & Doctors</h4>
                  <p className="text-xs text-slate-500">2 Hospitals, 2 Doctors</p>
                </div>
              </div>

              <div className="space-y-2 text-sm text-slate-700">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <div className="font-semibold text-slate-900">City Care Hospital (Primary)</div>
                  <div className="text-xs text-slate-500">
                    ID: <code className="font-mono">hospital-city-care</code> &bull; Doctor: Dr. Sameer Khan (Cardiology)
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <div className="font-semibold text-slate-900">Metro Community Hospital (Secondary)</div>
                  <div className="text-xs text-slate-500">
                    ID: <code className="font-mono">hospital-metro</code> &bull; Doctor: Dr. Ananya Sharma (General Medicine)
                  </div>
                </div>
              </div>
            </Card>

            {/* Prescriptions & Reports */}
            <Card>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-mediteal-light text-mediteal flex items-center justify-center">
                  <FileText className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Prescriptions & Reports</h4>
                  <p className="text-xs text-slate-500">
                    Spread over 2 hospitals & different dates
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm text-slate-700">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs">
                  <div className="font-semibold text-slate-900">7 Prescriptions</div>
                  <p className="text-slate-500 mt-0.5">
                    Dates: Today ({new Date().toISOString().slice(0, 10)}), Aug 2026, Apr 2026, Oct 2026, Sep 2026, Jul 2026, Jun 2026. Includes dosages, timings, duration, and lab tests.
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs">
                  <div className="font-semibold text-slate-900">7 Diagnostic Visit Reports</div>
                  <p className="text-slate-500 mt-0.5">
                    Complete with clinical observation notes, vitals review, ECG interpretations, and lab recommendations across both hospitals.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* 10 Patients Table */}
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-mediteal-light text-mediteal flex items-center justify-center">
                  <Users className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">10 Seeded Patients</h4>
                  <p className="text-xs text-slate-500">
                    {smartphoneCount} with Smartphone app &bull; {nonSmartphoneCount} SMS-only / No Smartphone
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                    <th className="py-2.5 px-3">ID</th>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Age / Gender</th>
                    <th className="py-2.5 px-3">Phone</th>
                    <th className="py-2.5 px-3">Smartphone</th>
                    <th className="py-2.5 px-3">Linked User</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {DEMO_DATA.patients.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-mono text-xs text-slate-500">{p.id}</td>
                      <td className="py-2 px-3 font-medium text-slate-900">{p.name}</td>
                      <td className="py-2 px-3 text-slate-600">
                        {p.age} yrs &bull; {p.gender}
                      </td>
                      <td className="py-2 px-3 font-mono text-xs text-slate-600">{p.phone}</td>
                      <td className="py-2 px-3">
                        {p.hasSmartphone ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Smartphone className="w-3 h-3" /> App
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            <MessageSquare className="w-3 h-3" /> SMS Only
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-xs text-slate-500">
                        {p.userId ? (
                          <span className="font-mono text-mediteal font-semibold">{p.userId}</span>
                        ) : (
                          <span className="text-slate-400">Desk Registered</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default DemoToolsPage;
