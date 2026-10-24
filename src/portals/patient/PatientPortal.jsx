import React, { useState } from 'react';
import { Clock, Pill, FileText, Ticket, CheckCircle2, Download } from 'lucide-react';
import { Navbar } from '../../shared/Navbar';
import { Tabs } from '../../shared/Tabs';
import { PageHeader } from '../../shared/PageHeader';
import { Button } from '../../shared/Button';
import {
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

  const tabs = [
    { id: 'queue', label: 'Queue', icon: Clock },
    { id: 'medicines', label: 'Medicines', icon: Pill },
    { id: 'records', label: 'Records', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Bar with brand on left, role and logout on right */}
      <Navbar />

      {/* Portal Tabs placed directly under the top bar */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Main Content centered at max-width 960px */}
      <main className="flex-1 w-full max-w-content mx-auto px-4 sm:px-6 py-8">
        
        {/* Tab 1: Queue */}
        {activeTab === 'queue' && (
          <div>
            <PageHeader
              title="Your Clinic Queue"
              subtitle="See your turn in line and know when the doctor is ready for you."
              action={
                <Button variant="primary" icon={Ticket}>
                  Take a Queue Number
                </Button>
              }
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PatientQueueCard />
              <BookTokenPage />
            </div>
          </div>
        )}

        {/* Tab 2: Medicines */}
        {activeTab === 'medicines' && (
          <div>
            <PageHeader
              title="Your Medicines Today"
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

        {/* Tab 3: Records */}
        {activeTab === 'records' && (
          <div>
            <PageHeader
              title="Your Health Records"
              subtitle="View visit summaries and doctor notes at any time."
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
      </main>
    </div>
  );
}
