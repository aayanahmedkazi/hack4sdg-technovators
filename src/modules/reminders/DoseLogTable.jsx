import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Activity,
  Filter,
  RotateCcw,
  UserCheck,
  TrendingUp,
} from 'lucide-react';
import { Card } from '../../shared/Card';
import { StatusBadge } from '../../shared/StatusBadge';
import { subscribeToDoseLogs, updateDoseLogStatus } from '../../shared/dataService';
import { useAuth } from '../../auth/AuthContext';

export function DoseLogTable({ patientId: propPatientId, className = '', compact = false }) {
  const { currentUser } = useAuth();
  
  // Resolve patient ID: prop takes precedence (e.g. passed from doctor portal), then auth context, then fallback to demo patient
  const patientId = propPatientId || currentUser?.patientId || (currentUser?.uid === 'demo-patient-001' ? 'pat-001' : 'pat-001');

  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'taken' | 'missed' | 'pending'
  const [loading, setLoading] = useState(true);

  // Subscribe to live doseLogs for this patient
  useEffect(() => {
    if (!patientId) {
      setLogs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToDoseLogs(patientId, (allLogs) => {
      setLogs(allLogs || []);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [patientId]);

  // Compute doctor's clinical adherence metrics
  const { adherencePercent, takenCount, missedCount, pendingCount, totalCount, statusBadgeVariant } = useMemo(() => {
    const total = logs.length;
    const taken = logs.filter((l) => l.status === 'taken').length;
    const missed = logs.filter((l) => l.status === 'missed').length;
    const pending = logs.filter((l) => l.status === 'pending').length;

    // Evaluated past doses
    const evaluated = taken + missed;
    let percent = 100;
    if (evaluated > 0) {
      percent = Math.round((taken / evaluated) * 100);
    } else if (total > 0 && pending > 0) {
      percent = 100; // All upcoming
    }

    let variant = 'teal';
    if (percent >= 80) variant = 'teal';
    else if (percent >= 50) variant = 'warning';
    else variant = 'coral';

    return {
      adherencePercent: percent,
      takenCount: taken,
      missedCount: missed,
      pendingCount: pending,
      totalCount: total,
      statusBadgeVariant: variant,
    };
  }, [logs]);

  // Filtered rows
  const filteredLogs = useMemo(() => {
    return logs
      .filter((l) => {
        if (filter === 'all') return true;
        return l.status === filter;
      })
      .sort((a, b) => (b.scheduledTime || '').localeCompare(a.scheduledTime || ''));
  }, [logs, filter]);

  const handleToggleStatus = async (doseId, currentStatus) => {
    const nextStatus = currentStatus === 'taken' ? 'missed' : 'taken';
    await updateDoseLogStatus(doseId, nextStatus);
    setLogs((prev) =>
      prev.map((d) => (d.id === doseId ? { ...d, status: nextStatus } : d))
    );
  };

  return (
    <Card className={`hover:border-slate-300 transition-colors ${className}`}>
      {/* Doctor Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3.5 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-mediteal shrink-0">
            <Activity className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Medication Adherence
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600">
                Doctor View
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono">
              Patient ID: {patientId}
            </p>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center space-x-1 self-start sm:self-center">
          {['all', 'taken', 'missed', 'pending'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition ${
                filter === tab
                  ? 'bg-mediteal text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ==============================================================
          ADHERENCE PERCENTAGE SCORECARD
         ============================================================== */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 mb-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
              Overall Patient Adherence
            </span>
            <div className="flex items-baseline space-x-3">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {adherencePercent}%
              </span>
              <StatusBadge variant={statusBadgeVariant}>
                {adherencePercent >= 80
                  ? 'Good Compliance (≥80%)'
                  : adherencePercent >= 50
                  ? 'Moderate (50-79%)'
                  : 'Low Adherence (<50%)'}
              </StatusBadge>
            </div>
          </div>

          {/* Quick Counter Pills */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
              ✓ {takenCount} Taken
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200">
              ✕ {missedCount} Missed
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
              ◷ {pendingCount} Pending
            </span>
          </div>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
          {totalCount > 0 ? (
            <>
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{ width: `${(takenCount / totalCount) * 100}%` }}
                title={`Taken: ${takenCount}`}
              />
              <div
                className="bg-rose-500 h-full transition-all duration-500"
                style={{ width: `${(missedCount / totalCount) * 100}%` }}
                title={`Missed: ${missedCount}`}
              />
              <div
                className="bg-slate-300 h-full transition-all duration-500"
                style={{ width: `${(pendingCount / totalCount) * 100}%` }}
                title={`Pending: ${pendingCount}`}
              />
            </>
          ) : (
            <div className="bg-slate-200 h-full w-full" />
          )}
        </div>
      </div>

      {/* ==============================================================
          DOSE LOGS TABLE
         ============================================================== */}
      {loading ? (
        <div className="py-8 text-center text-slate-400 text-xs">
          Loading dose logs for patient...
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="py-8 text-center text-slate-500 text-sm bg-slate-50 rounded-xl border border-slate-200">
          No doses found matching "{filter}".
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-400 uppercase">
                <th className="py-2 px-3">Medicine & Dose</th>
                <th className="py-2 px-3">Scheduled Time</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Doctor Notes</th>
                <th className="py-2 px-3 text-right">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => {
                const isTaken = log.status === 'taken';
                const isMissed = log.status === 'missed';
                const isPending = log.status === 'pending';

                return (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{log.medicineName}</div>
                      {log.dose && <div className="text-[11px] text-slate-500">{log.dose}</div>}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-xs text-slate-600">
                      {log.scheduledTime}
                    </td>
                    <td className="py-2.5 px-3">
                      {isTaken && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Taken
                        </span>
                      )}
                      {isMissed && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          Missed
                        </span>
                      )}
                      {isPending && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-xs text-slate-500 italic max-w-xs truncate">
                      {log.remarks || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(log.id, log.status)}
                        className="px-2 py-1 rounded text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition"
                        title="Click to toggle status"
                      >
                        Toggle
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

export default DoseLogTable;
