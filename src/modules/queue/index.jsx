import React from 'react';
import { Ticket, Clock, Users, Stethoscope, Tv, Play, Sliders, ChevronRight } from 'lucide-react';
import { Card } from '../../shared/Card';
import { StatusBadge } from '../../shared/StatusBadge';
import { Button } from '../../shared/Button';

function StubCard({ name, moduleName, description, icon: Icon, badgeVariant = 'teal', children }) {
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

      {children && (
        <div className="mt-4 pt-3 border-t border-slate-200">
          {children}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <span>Component Stub</span>
        <span className="font-mono text-[11px] text-slate-500">&lt;{name} /&gt;</span>
      </div>
    </Card>
  );
}

export function BookTokenPage(props) {
  return (
    <StubCard
      name="BookTokenPage"
      moduleName="Queue"
      icon={Ticket}
      description="Takes a new clinic token with a single tap for hospital outpatient consultation."
      {...props}
    />
  );
}

export function PatientQueueCard(props) {
  return (
    <StubCard
      name="PatientQueueCard"
      moduleName="Queue"
      icon={Clock}
      description="Shows your current queue number, doctors currently seeing patients, and estimated wait time."
      {...props}
    />
  );
}

export function ReceptionTokenDesk(props) {
  return (
    <StubCard
      name="ReceptionTokenDesk"
      moduleName="Queue"
      icon={Users}
      description="Desk controls for receptionists to issue, call, or transfer clinic queue tokens."
      {...props}
    />
  );
}

export function DoctorQueueControls(props) {
  return (
    <StubCard
      name="DoctorQueueControls"
      moduleName="Queue"
      icon={Stethoscope}
      description="Doctor controls to call the next patient into the room with one tap."
      {...props}
    />
  );
}

export function QueueDisplayBoard(props) {
  return (
    <StubCard
      name="QueueDisplayBoard"
      moduleName="Queue"
      icon={Tv}
      description="Clean waiting lounge display showing tokens currently being served across doctor rooms."
      {...props}
    />
  );
}

export function DoctorDayStart({ isStarted = false, onStart, ...props }) {
  return (
    <StubCard
      name="DoctorDayStart"
      moduleName="Queue"
      icon={Play}
      description="Sets clinic room number, max token limit, and opens today's consultation queue."
      {...props}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-700 font-medium">
          Clinic Day Status: {isStarted ? (
            <span className="text-mediteal font-bold">● Started</span>
          ) : (
            <span className="text-slate-500">Not Started Yet</span>
          )}
        </span>
        {!isStarted && onStart && (
          <Button variant="primary" size="small" onClick={onStart}>
            Start Clinic Day
          </Button>
        )}
      </div>
    </StubCard>
  );
}

export function DoctorDayControls({ isStarted = false, ...props }) {
  return (
    <StubCard
      name="DoctorDayControls"
      moduleName="Queue"
      icon={Sliders}
      description="Pause, put on hold, or finish today's clinic session with a single tap."
      {...props}
    />
  );
}

export function DoctorNextButton({ onNext, disabled = false, ...props }) {
  return (
    <div className="inline-block" {...props}>
      <Button
        variant="primary"
        onClick={onNext}
        disabled={disabled}
        icon={ChevronRight}
        className="!min-h-[44px]"
      >
        Next Patient
      </Button>
    </div>
  );
}
