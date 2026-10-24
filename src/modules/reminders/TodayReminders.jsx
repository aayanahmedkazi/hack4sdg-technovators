import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Pill,
  Sparkles,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../../shared/Button';
import { Card } from '../../shared/Card';
import { StatusBadge } from '../../shared/StatusBadge';
import { updateDoseLogStatus, subscribeToDoseLogs } from '../../shared/dataService';
import { useAuth } from '../../auth/AuthContext';
import { useDemoClock } from './demoClock';

/**
 * Format time string "HH:MM" or "YYYY-MM-DD HH:MM" into friendly 12h format "08:00 AM"
 */
function formatTime12(timeStr) {
  if (!timeStr) return '';
  const timeOnly = timeStr.includes(' ') ? timeStr.split(' ')[1] : timeStr;
  if (!timeOnly || !timeOnly.includes(':')) return timeStr;

  const [hours, minutes] = timeOnly.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
}

export function TodayReminders({ patientId: propPatientId, className = '' }) {
  const { currentUser } = useAuth();
  const { dateString, formattedTime } = useDemoClock();

  // Resolve target patient ID: prop -> currentUser patientId / uid -> 'pat-001'
  const patientId = propPatientId || currentUser?.patientId || (currentUser?.uid === 'demo-patient-001' ? 'pat-001' : 'pat-001');

  const [doses, setDoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState(null);

  // Subscribe to live dose logs
  useEffect(() => {
    if (!patientId) return;

    setLoading(true);
    const unsubscribe = subscribeToDoseLogs(patientId, (allLogs) => {
      setDoses(allLogs || []);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [patientId]);

  // Filter for today's doses
  const todayDoses = useMemo(() => {
    const todayStr = dateString;
    return doses
      .filter((d) => {
        // If scheduledTime contains a date, match dateString
        if (d.scheduledTime && d.scheduledTime.includes('-')) {
          return d.scheduledTime.startsWith(todayStr);
        }
        // If only time is provided, assume it is for today
        return true;
      })
      .sort((a, b) => {
        const timeA = (a.scheduledTime || '').split(' ').pop();
        const timeB = (b.scheduledTime || '').split(' ').pop();
        return timeA.localeCompare(timeB);
      });
  }, [doses, dateString]);

  // Calculate completion progress
  const totalCount = todayDoses.length;
  const takenCount = todayDoses.filter((d) => d.status === 'taken').length;
  const pendingCount = todayDoses.filter((d) => d.status === 'pending').length;
  const progressPercent = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;

  // Handle Mark Taken
  const handleMarkTaken = async (doseId) => {
    setActionInProgress(doseId);
    try {
      await updateDoseLogStatus(doseId, 'taken');
      // Optimistically update
      setDoses((prev) =>
        prev.map((d) => (d.id === doseId ? { ...d, status: 'taken' } : d))
      );
    } catch (err) {
      console.error('Failed to update dose status:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <Card className={`hover:border-slate-300 transition-colors ${className}`}>
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3.5 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-mediteal shrink-0">
            <Calendar className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Today's Medicines
            </h3>
            <p className="text-xs text-slate-500">
              Daily schedule &bull; {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>

        {totalCount > 0 && (
          <div className="flex items-center space-x-2 self-start sm:self-center">
            <span className="text-xs font-semibold text-slate-600">
              {takenCount} of {totalCount} Taken
            </span>
            <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-mediteal rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Doses List */}
      {loading ? (
        <div className="py-12 text-center text-slate-400">
          <div className="w-7 h-7 border-3 border-mediteal border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs">Loading today's schedule...</p>
        </div>
      ) : todayDoses.length === 0 ? (
        <div className="py-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-mediteal mx-auto mb-3">
            <Pill className="w-6 h-6 stroke-[1.75]" />
          </div>
          <h4 className="text-base font-bold text-slate-900">
            No Medicines Scheduled Today
          </h4>
          <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
            You have no pending doses on your schedule for today.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {todayDoses.map((dose) => {
            const isTaken = dose.status === 'taken';
            const isMissed = dose.status === 'missed';
            const isPending = dose.status === 'pending';
            const formattedTimeStr = formatTime12(dose.scheduledTime);

            return (
              <div
                key={dose.id}
                className={`p-4 rounded-xl border transition-all ${
                  isTaken
                    ? 'bg-slate-50/70 border-slate-200 opacity-90'
                    : isMissed
                    ? 'bg-medicoral-light/30 border-medicoral/30'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  
                  {/* Left Column: Time & Medicine Info */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-slate-700 px-2 py-0.5 rounded bg-slate-100">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {formattedTimeStr}
                      </span>

                      {isTaken && (
                        <StatusBadge variant="default">
                          Taken
                        </StatusBadge>
                      )}
                      {isPending && (
                        <StatusBadge variant="teal">
                          Due Today
                        </StatusBadge>
                      )}
                      {isMissed && (
                        <StatusBadge variant="coral">
                          Missed
                        </StatusBadge>
                      )}
                    </div>

                    <div>
                      <h4 className={`text-base font-bold tracking-tight ${isTaken ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                        {dose.medicineName}
                      </h4>
                      <p className="text-xs font-medium text-slate-600">
                        Dose: <strong className="text-slate-800">{dose.dose || '1 tablet'}</strong>
                      </p>
                    </div>

                    {dose.remarks && (
                      <p className="text-xs text-slate-500 italic">
                        "{dose.remarks}"
                      </p>
                    )}
                  </div>

                  {/* Right Column: BIG "Taken" Button */}
                  <div className="shrink-0 self-stretch sm:self-center flex sm:flex-col justify-end">
                    {isPending && (
                      <Button
                        variant="primary"
                        size="medium"
                        icon={CheckCircle2}
                        onClick={() => handleMarkTaken(dose.id)}
                        disabled={actionInProgress === dose.id}
                        className="w-full sm:w-auto !min-h-[44px] !px-5 font-bold shadow-sm"
                      >
                        {actionInProgress === dose.id ? 'Recording...' : 'Taken'}
                      </Button>
                    )}

                    {isTaken && (
                      <div className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4 mr-1.5 stroke-[2.5]" />
                        Completed
                      </div>
                    )}

                    {isMissed && (
                      <Button
                        variant="secondary"
                        size="small"
                        icon={CheckCircle2}
                        onClick={() => handleMarkTaken(dose.id)}
                        disabled={actionInProgress === dose.id}
                        className="w-full sm:w-auto !min-h-[38px] text-xs font-semibold text-slate-700"
                      >
                        Mark Taken Late
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-4 pt-3.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
        <span>Patient Medication Log</span>
        <span className="font-mono text-[11px] text-slate-500">
          {pendingCount === 0 && totalCount > 0 ? 'All doses taken today ✓' : `${pendingCount} pending`}
        </span>
      </div>
    </Card>
  );
}

export default TodayReminders;
