import React, { useState } from 'react';
import {
  Clock,
  Pill,
  FileText,
  Ticket,
  CheckCircle2,
  Download,
  Calendar,
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
  TestReminders,
  DoseLogTable,
  DemoClockControl,
  SmsMockPanel,
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

        {/* Tab 2: Appointments / Records */}
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
              <PatientRecordsPage onlyForm />
              <RecordFolders />
            </div>
          </div>
        )}

        {/* Tab 3: Prescriptions */}
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
              <TestReminders />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TodayReminders />
                <DoseLogTable />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <DemoClockControl />
                <SmsMockPanel />
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default PatientPortal;
