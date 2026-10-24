import React, { useState } from 'react';
import {
  Clock,
  Pill,
  FileText,
  Ticket,
  CheckCircle2,
  Download,
  Calendar,
  HeartPulse,
  ArrowRight,
} from 'lucide-react';
import { Navbar } from '../../shared/Navbar';
import { PageHeader } from '../../shared/PageHeader';
import { Button } from '../../shared/Button';
import {
  ClinicQueueSystem,
  PatientQueueCard,
  BookTokenPage,
} from '../../modules/queue/index.js';
import {
  TodayReminders,
  ReminderAlarm,
  DoseLogTable,
} from '../../modules/reminders/index.js';
import {
  PatientRecordsPage,
  RecordFolders,
} from '../../modules/records/index.js';

export function PatientPortal() {
  const [activeTab, setActiveTab] = useState('queue');

  return (
    <div className="min-h-screen bg-[#F8FAFB] flex flex-col">
      {/* Top Bar with MediFlow brand, centered navigation links, and profile */}
      <Navbar
        activeNav={activeTab}
        onNavChange={setActiveTab}
        showPatientNav={true}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* Tab 1: Queue / Home (Matching user's screenshot) */}
        {(activeTab === 'queue' || activeTab === 'home') && (
          <ClinicQueueSystem
            initialTokenNumber={10}
            initialNowServing={3}
            initialDoctor={{
              name: 'Dr. Sameer Khan',
              speciality: 'Cardiology',
              room: 'Room 1',
              status: 'On Duty',
            }}
            initialPatientName="Aarav Sharma"
            initialPhone="+91 98765 43210"
          />
        )}


        {/* Tab 3: Appointments / Records */}
        {activeTab === 'appointments' && (
          <div>
            <PageHeader
              title="Your Health Records & Visits"
              subtitle="View consultation summaries, upcoming visits, and doctor notes."
              action={
                <Button variant="secondary" icon={Download}>
                  Download Summary
                </Button>
              }
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PatientRecordsPage />
              <RecordFolders />
            </div>
          </div>
        )}

        {/* Tab 4: Prescriptions */}
        {(activeTab === 'prescriptions' || activeTab === 'medicines') && (
          <div>
            <PageHeader
              title="Your Prescriptions & Daily Reminders"
              subtitle="Daily reminders so you never miss a dose."
              action={
                <Button variant="primary" icon={CheckCircle2}>
                  I Took My Medicine
                </Button>
              }
            />
            <div className="space-y-6">
              <ReminderAlarm />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TodayReminders />
                <DoseLogTable />
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Pharmacy */}
        {activeTab === 'pharmacy' && (
          <div className="space-y-6">
            <PageHeader
              title="Hospital Pharmacy"
              subtitle="Order prescribed medications for pickup or bedside delivery."
            />
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-mediteal mx-auto mb-4">
                <HeartPulse className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Pharmacy Counter Open</h3>
              <p className="text-sm text-slate-500 mb-6">
                Your prescribed Paracetamol 500mg and Cetirizine 10mg are ready at Counter B.
              </p>
              <Button variant="primary" onClick={() => setActiveTab('queue')}>
                Return to Clinic Queue
              </Button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default PatientPortal;
