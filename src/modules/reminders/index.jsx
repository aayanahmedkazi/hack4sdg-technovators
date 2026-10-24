import React from 'react';
import { Calendar, Bell, CheckCircle2, FlaskConical, Clock, MessageSquare } from 'lucide-react';
import { Card } from '../../shared/Card';
import { StatusBadge } from '../../shared/StatusBadge';

function StubCard({ name, moduleName, description, icon: Icon, badgeVariant = 'teal', alert = false }) {
  return (
    <Card alert={alert} className="hover:border-slate-300 transition-colors">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center space-x-3">
          <div className={`w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center ${alert ? 'text-medicoral' : 'text-mediteal'} shrink-0`}>
            {Icon && <Icon className="w-5 h-5 stroke-[2]" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{name}</h3>
            <p className="text-xs text-slate-500 font-mono">
              src/modules/{moduleName.toLowerCase()}/index.js
            </p>
          </div>
        </div>
        <StatusBadge variant={alert ? 'coral' : badgeVariant}>
          {moduleName}
        </StatusBadge>
      </div>

      <p className="text-sm text-slate-600 mt-2">
        {description}
      </p>

      <div className="mt-5 pt-3.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
        <span>Component Stub</span>
        <span className="font-mono text-[11px] text-slate-500">&lt;{name} /&gt;</span>
      </div>
    </Card>
  );
}

export function TodayReminders(props) {
  return (
    <StubCard
      name="TodayReminders"
      moduleName="Reminders"
      icon={Calendar}
      description="Easy-to-read schedule of your medicines due today with morning, noon, and night times."
      {...props}
    />
  );
}

export function ReminderAlarm(props) {
  return (
    <StubCard
      name="ReminderAlarm"
      moduleName="Reminders"
      icon={Bell}
      alert={true}
      description="Immediate alert banner showing a medicine dose that is due right now with a 'Taken' button."
      {...props}
    />
  );
}

export function DoseLogTable(props) {
  return (
    <StubCard
      name="DoseLogTable"
      moduleName="Reminders"
      icon={CheckCircle2}
      description="Simple checklist recording whether you took your medicine doses today."
      {...props}
    />
  );
}

export function TestReminders(props) {
  return (
    <StubCard
      name="TestReminders"
      moduleName="Reminders"
      icon={FlaskConical}
      badgeVariant="neutral"
      description="One-click testing tool to trigger simulated medicine alerts."
      {...props}
    />
  );
}

export function DemoClockControl(props) {
  return (
    <StubCard
      name="DemoClockControl"
      moduleName="Reminders"
      icon={Clock}
      badgeVariant="neutral"
      description="Fast-forward the virtual demo clock to test morning and evening medicine schedules."
      {...props}
    />
  );
}

export function SmsMockPanel(props) {
  return (
    <StubCard
      name="SmsMockPanel"
      moduleName="Reminders"
      icon={MessageSquare}
      badgeVariant="neutral"
      description="Preview simulated phone text messages sent to patients when a dose is due."
      {...props}
    />
  );
}
