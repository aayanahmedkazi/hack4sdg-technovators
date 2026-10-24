import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Stethoscope, Play, UserCheck, AlertCircle } from 'lucide-react';
import { Navbar } from '../../shared/Navbar';
import { PageHeader } from '../../shared/PageHeader';
import { Button } from '../../shared/Button';
import { Card } from '../../shared/Card';
import { useAuth } from '../../auth/AuthContext';
import { useCurrentPatient } from '../../shared/useCurrentPatient';

// Module stub components
import {
  DoctorDayStart,
  DoctorDayControls,
  DoctorNextButton,
} from '../../modules/queue/index.js';

import {
  PrescriptionForm,
  CurrentPatientSheet,
  PastRecordsPanel,
} from '../../modules/records/index.js';
import { DoseLogTable } from '../../modules/reminders/index.js';

export function DoctorPortal() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active view based on URL path or internal state
  const isPrescribeRoute = location.pathname.includes('/prescribe');
  const [internalPage, setInternalPage] = useState(isPrescribeRoute ? 'prescribe' : 'dashboard');

  // Track if doctor has started their clinic day
  const [dayStarted, setDayStarted] = useState(false);

  // Doctor identification
  const doctorId = currentUser?.doctorId || 'doc-001';
  const doctorName = currentUser?.displayName || 'Dr. Sameer Khan';

  // Live patient listener
  const livePatientId = useCurrentPatient(doctorId);
  // Allow toggling patient in demo when clicking Next button
  const [demoPatientId, setDemoPatientId] = useState(undefined);
  const patientId = demoPatientId !== undefined ? demoPatientId : livePatientId;

  // Temporary flag in doctor dashboard to bypass day start check in dev mode
  const skipDayStart = import.meta.env?.VITE_DEV_SKIP_DAY_START === 'true';
  const canStartPrescribing = skipDayStart || dayStarted;

  const openPrescribePage = () => {
    navigate('/doctor/prescribe');
  };

  const openDashboardPage = () => {
    setInternalPage('dashboard');
    try {
      navigate('/doctor');
    } catch (e) {
      // Fallback
    }
  };

  const handleNextPatient = () => {
    // If no patient is currently being served, call the first patient
    if (!patientId) {
      setDemoPatientId('pat-001');
    } else if (patientId === 'pat-001') {
      setDemoPatientId('pat-002');
    } else {
      setDemoPatientId(null);
    }
  };

  const currentPage = isPrescribeRoute ? 'prescribe' : internalPage;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Bar with brand on left, role and logout on right (no tabs) */}
      <Navbar />

      <main className="flex-1 w-full max-w-content mx-auto px-4 sm:px-6 py-8">
        
        {/* ==============================================================
            PAGE 1: DASHBOARD (/doctor)
           ============================================================== */}
        {currentPage === 'dashboard' && (
          <div className="space-y-8">
            <PageHeader
              title="Doctor Clinic Dashboard"
              subtitle="Start your session, set room limits, and begin outpatient consultations."
            />

            {/* DoctorDayStart on top */}
            <DoctorDayStart
              isStarted={dayStarted}
              onStart={() => setDayStarted(true)}
            />

            {/* DoctorDayControls below it */}
            <DoctorDayControls isStarted={dayStarted} />

            {/* One big button 'Start prescribing' */}
            <div className="pt-4">
              <Button
                variant="primary"
                size="large"
                fullWidth
                disabled={!canStartPrescribing}
                onClick={openPrescribePage}
                className="!py-4 !text-lg !font-bold"
              >
                Start prescribing →
              </Button>

              {!canStartPrescribing && (
                <p className="text-center text-sm text-slate-500 mt-2.5">
                  Please click "Start Clinic Day" above to enable prescribing.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ==============================================================
            PAGE 2: PRESCRIBING (/doctor/prescribe)
           ============================================================== */}
        {currentPage === 'prescribe' && (
          <div className="space-y-6">
            
            {/* Header row: Doctor name on the left, DoctorNextButton on the right */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={openDashboardPage}
                  className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-medicard transition"
                  title="Back to Dashboard"
                >
                  <ArrowLeft className="w-5 h-5 stroke-[2]" />
                </button>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    {doctorName}
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">
                    Consultation Room &bull; Prescribing Session
                  </p>
                </div>
              </div>

              {/* DoctorNextButton on the right */}
              <div className="shrink-0 flex items-center space-x-2">
                <DoctorNextButton onNext={handleNextPatient} />
              </div>
            </div>

            {/* Patient Content Area */}
            {patientId === null ? (
              /* If patientId is null: Show clean message instead of columns */
              <Card className="text-center py-16 px-6">
                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-mediteal mx-auto mb-4">
                  <UserCheck className="w-7 h-7 stroke-[1.75]" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  No patient yet. Press Next to call the first patient.
                </h2>
                <p className="text-base text-slate-500 max-w-md mx-auto mb-6">
                  When you press "Next Patient", the queue system will call the next token into your room.
                </p>
                <DoctorNextButton onNext={handleNextPatient} />
              </Card>
            ) : (
              /* Two columns (stacked on phones): LEFT 60% PrescriptionForm, RIGHT 40% CurrentPatientSheet + PastRecordsPanel */
              <div className="flex flex-col md:flex-row gap-6 items-start">
                
                {/* LEFT column (about 60% width) */}
                <div className="w-full md:w-[60%]">
                  <PrescriptionForm patientId={patientId} />
                </div>

                {/* RIGHT column (about 40% width) */}
                <div className="w-full md:w-[40%] space-y-6">
                  {/* CurrentPatientSheet on top */}
                  <CurrentPatientSheet patientId={patientId} />

                  {/* DoseLogTable for doctor to check adherence */}
                  <DoseLogTable patientId={patientId} />
                  
                  {/* PastRecordsPanel below it */}
                  <PastRecordsPanel patientId={patientId} />
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default DoctorPortal;
