import React, { useState } from 'react';
import { Ticket, Users, Tv, Plus, UserPlus, Maximize2 } from 'lucide-react';
import { Navbar } from '../../shared/Navbar';
import { Tabs } from '../../shared/Tabs';
import { PageHeader } from '../../shared/PageHeader';
import { Button } from '../../shared/Button';
import {
  ReceptionTokenDesk,
  BookTokenPage,
  QueueDisplayBoard,
} from '../../modules/queue/index.js';
import {
  RegisterPatientForm,
  PatientSearch,
} from '../../modules/records/index.js';

export function ReceptionistPortal() {
  const [activeTab, setActiveTab] = useState('tokens');

  const tabs = [
    { id: 'tokens', label: 'Tokens', icon: Ticket },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'display', label: 'Display board', icon: Tv },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Bar with brand on left, role and logout on right */}
      <Navbar />

      {/* Portal Tabs placed directly under the top bar */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Main Content centered at max-width 960px */}
      <main className="flex-1 w-full max-w-content mx-auto px-4 sm:px-6 py-8">
        
        {/* Tab 1: Tokens */}
        {activeTab === 'tokens' && (
          <div>
            <PageHeader
              title="Front Desk Tokens"
              subtitle="Issue walk-in tokens and manage doctor room queues."
              action={
                <Button variant="primary" icon={Plus}>
                  Issue Walk-in Token
                </Button>
              }
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ReceptionTokenDesk />
              <BookTokenPage />
            </div>
          </div>
        )}

        {/* Tab 2: Patients */}
        {activeTab === 'patients' && (
          <div>
            <PageHeader
              title="Patient Directory"
              subtitle="Find returning patients or register a new file in seconds."
              action={
                <Button variant="primary" icon={UserPlus}>
                  Register Patient
                </Button>
              }
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PatientSearch />
              <RegisterPatientForm />
            </div>
          </div>
        )}

        {/* Tab 3: Display Board */}
        {activeTab === 'display' && (
          <div>
            <PageHeader
              title="Waiting Lounge Display"
              subtitle="Live screen showing called tokens and active doctor consultation rooms."
              action={
                <Button variant="secondary" icon={Maximize2}>
                  Open Big Screen
                </Button>
              }
            />
            <QueueDisplayBoard />
          </div>
        )}
      </main>
    </div>
  );
}
