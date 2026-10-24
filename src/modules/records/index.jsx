import React from 'react';
import { UserPlus, Search, Folder, Pill, ClipboardList, FileText, History } from 'lucide-react';
import { Card } from '../../shared/Card';
import { StatusBadge } from '../../shared/StatusBadge';

function StubCard({ name, moduleName, description, icon: Icon, badgeVariant = 'teal', patientId }) {
  return (
    <Card className="hover:border-slate-300 transition-colors">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-mediteal shrink-0">
            {Icon && <Icon className="w-5 h-5 stroke-[2]" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{name}</h3>
            <p className="text-xs text-slate-500 font-mono">
              src/modules/{moduleName.toLowerCase()}/index.js
            </p>
          </div>
        </div>
        <StatusBadge variant={badgeVariant}>
          {moduleName}
        </StatusBadge>
      </div>

      <p className="text-sm text-slate-600 mt-2">
        {description}
      </p>

      {patientId !== undefined && (
        <div className="mt-3 inline-flex items-center px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs font-mono text-slate-600">
          patientId: {patientId || 'null'}
        </div>
      )}

      <div className="mt-4 pt-3.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
        <span>Component Stub</span>
        <span className="font-mono text-[11px] text-slate-500">&lt;{name} /&gt;</span>
      </div>
    </Card>
  );
}

export function RegisterPatientForm(props) {
  return (
    <StubCard
      name="RegisterPatientForm"
      moduleName="Records"
      icon={UserPlus}
      description="Simple form to register a new patient with their name, phone number, and basic details."
      {...props}
    />
  );
}

export function PatientSearch(props) {
  return (
    <StubCard
      name="PatientSearch"
      moduleName="Records"
      icon={Search}
      description="Instant search box to look up a patient by their phone number or name."
      {...props}
    />
  );
}

export function RecordFolders(props) {
  return (
    <StubCard
      name="RecordFolders"
      moduleName="Records"
      icon={Folder}
      description="Organized medical folders holding past doctor visits, lab tests, and health summaries."
      {...props}
    />
  );
}

export function PrescriptionForm(props) {
  return (
    <StubCard
      name="PrescriptionForm"
      moduleName="Records"
      icon={Pill}
      description="One-action form for doctors to prescribe medications, times, and instructions."
      {...props}
    />
  );
}

export function CurrentPatientSheet(props) {
  return (
    <StubCard
      name="CurrentPatientSheet"
      moduleName="Records"
      icon={ClipboardList}
      description="Active consultation sheet showing patient information, reason for visit, and notes."
      {...props}
    />
  );
}

export function PastRecordsPanel(props) {
  return (
    <StubCard
      name="PastRecordsPanel"
      moduleName="Records"
      icon={History}
      description="Timeline of past clinic visits, previous prescriptions, and lab test reports for the current patient."
      {...props}
    />
  );
}

export function PatientRecordsPage(props) {
  return (
    <StubCard
      name="PatientRecordsPage"
      moduleName="Records"
      icon={FileText}
      description="Patient-friendly health records list with simple visit dates and doctor summaries."
      {...props}
    />
  );
}
