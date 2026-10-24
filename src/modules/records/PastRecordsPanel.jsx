import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Folder,
  Pill,
  FileText,
  Clock,
  FlaskConical,
  Building2,
  User,
  Calendar,
  AlertCircle,
  FileClock,
} from 'lucide-react';
import { Card } from '../../shared/Card';
import { Button } from '../../shared/Button';
import { StatusBadge } from '../../shared/StatusBadge';
import { RecordFolders } from './RecordFolders';

export function PastRecordsPanel({ patientId, className = '' }) {
  const [activeRecord, setActiveRecord] = useState(null);

  // Clear active record when patientId changes
  useEffect(() => {
    setActiveRecord(null);
  }, [patientId]);

  // Empty state when no patient is selected
  if (!patientId) {
    return (
      <Card className={`p-6 text-center bg-white border-slate-200 ${className}`}>
        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2.5">
          <FileClock className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-bold text-slate-800">No Past Records</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-[260px] mx-auto">
          Past prescriptions, test reports, and hospital visit folders will appear here once a patient is selected.
        </p>
      </Card>
    );
  }

  // Record details drilldown view with "Back" button
  if (activeRecord) {
    const isRx = activeRecord.type === 'prescription';

    return (
      <Card className={`p-5 bg-white border-slate-200 shadow-sm ${className}`}>
        {/* Back Button */}
        <div className="mb-4 pb-3 border-b border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setActiveRecord(null)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-mediteal hover:text-mediteal-hover transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to folders</span>
          </button>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            Read-only Reference
          </span>
        </div>

        {/* Record Meta Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge variant={isRx ? 'teal' : 'neutral'} className="text-[10px] !py-0.5">
              {isRx ? 'Prescription' : 'Report'}
            </StatusBadge>
            <span className="font-mono text-xs font-bold text-slate-900">
              {activeRecord.date}
            </span>
          </div>

          <h3 className="text-base font-bold text-slate-900">
            {isRx ? activeRecord.summary : activeRecord.title}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              {activeRecord.hospitalName || 'MediFlow City Clinic'}
            </span>
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              {activeRecord.doctorName || 'Dr. Sameer Khan'}
            </span>
          </div>
        </div>

        {/* Prescription Details */}
        {isRx && (
          <div className="space-y-4 pt-1">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5 text-mediteal" />
                Previous Medicines ({activeRecord.medicines?.length || 0})
              </h4>

              {activeRecord.medicines?.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No medicines in this prescription.</p>
              ) : (
                <div className="space-y-2">
                  {activeRecord.medicines.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {m.name}
                        </span>
                        <span className="font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded text-[11px]">
                          {m.dose || '1 dose'}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-600 text-xs">
                        {m.timesPerDay && (
                          <span>
                            <strong>Frequency:</strong> {m.timesPerDay} time{m.timesPerDay === 1 ? '' : 's'}/day
                          </span>
                        )}
                        {m.durationDays && (
                          <span>
                            <strong>Duration:</strong> {m.durationDays} day{m.durationDays === 1 ? '' : 's'}
                          </span>
                        )}
                        {m.timings && m.timings.length > 0 && (
                          <span className="inline-flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {Array.isArray(m.timings) ? m.timings.join(', ') : m.timings}
                          </span>
                        )}
                      </div>

                      {m.remarks && (
                        <div className="mt-2 text-xs text-amber-900 bg-amber-50/80 border border-amber-200/60 px-2.5 py-1 rounded-md">
                          <strong>Remarks:</strong> {m.remarks}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tests in prescription */}
            {activeRecord.tests && activeRecord.tests.length > 0 && (
              <div className="pt-2 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FlaskConical className="w-3.5 h-3.5 text-mediteal" />
                  Prescribed Diagnostic Tests
                </h4>
                <div className="space-y-1.5">
                  {activeRecord.tests.map((t, tIdx) => (
                    <div
                      key={tIdx}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                    >
                      <span className="font-semibold text-slate-800">
                        {t.name || t}
                      </span>
                      {t.date && (
                        <span className="font-mono text-slate-500 text-[11px]">
                          {t.date}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Report Details */}
        {!isRx && (
          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-mediteal" />
              Report Notes & Observations
            </h4>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 text-xs whitespace-pre-wrap leading-relaxed">
              {activeRecord.notes || 'No observation notes attached.'}
            </div>
          </div>
        )}
      </Card>
    );
  }

  // Default folder tree view (reusing RecordFolders)
  return (
    <div className={className}>
      <RecordFolders
        patientId={patientId}
        onSelectRecord={(rec) => setActiveRecord(rec)}
        title="Past Records & Folders"
      />
    </div>
  );
}
