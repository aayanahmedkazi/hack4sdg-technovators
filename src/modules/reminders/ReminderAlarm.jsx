import React, { useState, useEffect, useMemo } from 'react';
import {
  Bell,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  Volume2,
  Calendar,
  Sparkles,
  Pill,
} from 'lucide-react';
import { Button } from '../../shared/Button';
import { Card } from '../../shared/Card';
import { StatusBadge } from '../../shared/StatusBadge';
import { updateDoseLogStatus, subscribeToDoseLogs } from '../../shared/dataService';
import { useAuth } from '../../auth/AuthContext';
import { useDemoClock, setVirtualTime, resetVirtualTime } from './demoClock';

/**
 * Parses scheduledTime string into a Date object.
 * Handles both "YYYY-MM-DD HH:MM" and "HH:MM" formats.
 */
function parseDoseDateTime(scheduledTime, todayDateStr) {
  if (!scheduledTime) return new Date();

  if (scheduledTime.includes('-') && scheduledTime.includes(':')) {
    // Format: "YYYY-MM-DD HH:MM"
    const [datePart, timePart] = scheduledTime.split(' ');
    const [y, m, d] = datePart.split('-').map(Number);
    const [hh, mm] = timePart.split(':').map(Number);
    return new Date(y, m - 1, d, hh, mm, 0, 0);
  } else if (scheduledTime.includes(':')) {
    // Format: "HH:MM"
    const [hh, mm] = scheduledTime.split(':').map(Number);
    const [y, m, d] = (todayDateStr || new Date().toISOString().slice(0, 10)).split('-').map(Number);
    return new Date(y, m - 1, d, hh, mm, 0, 0);
  }

  return new Date();
}

/**
 * Formats time nicely for display, e.g. "08:00 AM"
 */
function formatTime12(date) {
  if (!date) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function ReminderAlarm({ patientId: propPatientId, className = '' }) {
  const { currentUser } = useAuth();
  const { virtualTime, dateString, isCustomTime } = useDemoClock();

  // Resolve target patient ID: prop -> currentUser patientId / uid -> 'pat-001'
  const patientId = propPatientId || currentUser?.patientId || (currentUser?.uid === 'demo-patient-001' ? 'pat-001' : 'pat-001');

  const [doseLogs, setDoseLogs] = useState([]);
  const [snoozedIds, setSnoozedIds] = useState(new Set());
  const [dismissedBannerIds, setDismissedBannerIds] = useState(new Set());
  const [takenAnimationId, setTakenAnimationId] = useState(null);

  // Subscribe to live doseLogs for this patient
  useEffect(() => {
    if (!patientId) return;
    const unsubscribe = subscribeToDoseLogs(patientId, (logs) => {
      setDoseLogs(logs || []);
    });
    return () => unsubscribe();
  }, [patientId]);

  // Evaluate doses relative to current virtual demo clock
  const { quietBannerDoses, alarmDoses } = useMemo(() => {
    const banners = [];
    const alarms = [];

    const todayStr = dateString;
    const nowMs = virtualTime.getTime();

    doseLogs.forEach((dose) => {
      // Check if dose belongs to today
      const isToday = !dose.scheduledTime.includes('-') || dose.scheduledTime.startsWith(todayStr);
      if (!isToday) return;

      const doseDate = parseDoseDateTime(dose.scheduledTime, todayStr);
      const doseMs = doseDate.getTime();
      const diffMinutes = Math.floor((nowMs - doseMs) / (60 * 1000));

      if (dose.status === 'pending') {
        // 1. If ignored for 30 minutes, mark as missed
        if (diffMinutes >= 30) {
          updateDoseLogStatus(dose.id, 'missed');
          // Optimistically update status locally
          dose.status = 'missed';
          return;
        }

        // 2. Full-screen alarm popup: at dose time (0 to 29 minutes after scheduled time)
        if (diffMinutes >= 0 && diffMinutes < 30) {
          if (!snoozedIds.has(dose.id)) {
            alarms.push({ ...dose, doseDate, diffMinutes });
          }
          return;
        }

        // 3. Quiet banner: 15 minutes before dose (-15 to -1 minutes)
        if (diffMinutes >= -15 && diffMinutes < 0) {
          if (!dismissedBannerIds.has(dose.id)) {
            const minutesUntil = Math.abs(diffMinutes);
            banners.push({ ...dose, doseDate, minutesUntil });
          }
          return;
        }
      }
    });

    return { quietBannerDoses: banners, alarmDoses: alarms };
  }, [doseLogs, virtualTime, dateString, snoozedIds, dismissedBannerIds]);

  // Handle Mark Taken
  const handleMarkTaken = async (doseId) => {
    setTakenAnimationId(doseId);
    await updateDoseLogStatus(doseId, 'taken');

    // Update local state immediately
    setDoseLogs((prev) =>
      prev.map((d) => (d.id === doseId ? { ...d, status: 'taken' } : d))
    );

    setTimeout(() => {
      setTakenAnimationId(null);
    }, 1200);
  };

  // Handle Snooze (5 minutes)
  const handleSnooze = (doseId) => {
    setSnoozedIds((prev) => new Set([...prev, doseId]));
    setTimeout(() => {
      setSnoozedIds((prev) => {
        const next = new Set(prev);
        next.delete(doseId);
        return next;
      });
    }, 5 * 60 * 1000);
  };

  // Active alarm is the first pending dose in the alarm window
  const activeAlarm = alarmDoses.length > 0 ? alarmDoses[0] : null;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* ==============================================================
          1. QUIET BANNER (15 minutes before a dose)
          Example: "Take Metformin 500 mg in 15 minutes"
         ============================================================== */}
      {quietBannerDoses.length > 0 && !activeAlarm && (
        <div className="space-y-3">
          {quietBannerDoses.map((bannerDose) => (
            <div
              key={bannerDose.id}
              className="p-4 sm:p-5 rounded-2xl bg-mediteal-light/80 border border-mediteal/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all animate-fadeIn shadow-sm"
            >
              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-white border border-mediteal/20 flex items-center justify-center text-mediteal shrink-0 mt-0.5">
                  <Bell className="w-5 h-5 stroke-[2] animate-bounce" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Take {bannerDose.medicineName} {bannerDose.dose ? `(${bannerDose.dose})` : ''} in {bannerDose.minutesUntil} {bannerDose.minutesUntil === 1 ? 'minute' : 'minutes'}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    Scheduled for {formatTime12(bannerDose.doseDate)} &bull; {bannerDose.remarks || 'Take with a glass of water'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                <Button
                  variant="primary"
                  size="small"
                  icon={CheckCircle2}
                  onClick={() => handleMarkTaken(bannerDose.id)}
                  className="!min-h-[38px] text-xs sm:text-sm font-semibold"
                >
                  Take Now
                </Button>
                <button
                  type="button"
                  onClick={() => setDismissedBannerIds((prev) => new Set([...prev, bannerDose.id]))}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white/60 transition"
                  title="Dismiss reminder"
                >
                  <X className="w-4 h-4 stroke-[2]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ==============================================================
          2. FULL-SCREEN ALARM-STYLE POPUP (At dose time, if still pending)
          Medicine name, how many to take, doctor's remarks, big Taken button
         ============================================================== */}
      {activeAlarm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 sm:p-6 animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden p-6 sm:p-8 text-center space-y-6">
            
            {/* Top Close / Snooze Icon */}
            <div className="absolute top-4 right-4">
              <button
                type="button"
                onClick={() => handleSnooze(activeAlarm.id)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                title="Snooze 5 mins"
              >
                <X className="w-5 h-5 stroke-[2]" />
              </button>
            </div>

            {/* Pulsing Alarm Icon */}
            <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-medicoral-light animate-ping opacity-60" />
              <div className="relative w-20 h-20 rounded-2xl bg-medicoral/10 border-2 border-medicoral flex items-center justify-center text-medicoral shadow-md">
                <Bell className="w-10 h-10 stroke-[2] animate-bounce" />
              </div>
            </div>

            {/* Badge & Timing */}
            <div className="space-y-1">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-medicoral-light text-medicoral border border-medicoral/30">
                Medicine Dose Due Now
              </span>
              <p className="text-xs text-slate-500 font-medium">
                Scheduled for {formatTime12(activeAlarm.doseDate)}
              </p>
            </div>

            {/* Main Medicine Name & How Many to Take */}
            <div className="space-y-2 py-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {activeAlarm.medicineName}
              </h2>
              <div className="inline-block px-4 py-1.5 rounded-xl bg-slate-100 text-slate-800 font-bold text-lg">
                Take {activeAlarm.dose || '1 dose'}
              </div>
            </div>

            {/* Doctor's Remarks */}
            <div className="p-4 rounded-2xl bg-medicard border border-slate-200 text-left">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Doctor's Instructions
              </span>
              <p className="text-sm font-medium text-slate-800">
                {activeAlarm.remarks || 'Take with water as advised by your doctor.'}
              </p>
            </div>

            {/* BIG "Taken" Button */}
            <div className="pt-2 space-y-3">
              <Button
                variant="primary"
                size="large"
                fullWidth
                icon={CheckCircle2}
                onClick={() => handleMarkTaken(activeAlarm.id)}
                className="!py-4 !text-lg !font-bold shadow-lg shadow-mediteal/20 hover:scale-[1.01] active:scale-[0.99] transition-transform"
              >
                {takenAnimationId === activeAlarm.id ? 'Recorded! ✓' : 'I Have Taken This Medicine'}
              </Button>

              <div className="flex items-center justify-center space-x-4 text-xs text-slate-500">
                <button
                  type="button"
                  onClick={() => handleSnooze(activeAlarm.id)}
                  className="hover:text-slate-800 underline underline-offset-2 transition"
                >
                  Snooze 5 minutes
                </button>
                <span>&bull;</span>
                <span className="text-slate-400">
                  Auto-marks missed after 30 mins
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          3. QUIET STATUS STRIP (When no alarm is firing)
          Shows virtual clock status & quick simulation shortcuts
         ============================================================== */}
      {!activeAlarm && quietBannerDoses.length === 0 && (
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center space-x-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-700">Reminder Monitor Active</span>
            <span className="hidden sm:inline text-slate-400">&bull;</span>
            <span className="text-slate-500">
              Virtual Demo Clock: <strong className="text-slate-800 font-mono">{formatTime12(virtualTime)}</strong>
            </span>
            {isCustomTime && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                Simulated Time
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setVirtualTime('07:45')}
              className="px-2 py-1 rounded bg-white border border-slate-200 hover:border-mediteal hover:text-mediteal transition font-mono text-[11px]"
              title="Jump virtual clock to 07:45 (triggers 15m quiet banner)"
            >
              Test 07:45 Banner
            </button>
            <button
              type="button"
              onClick={() => setVirtualTime('08:00')}
              className="px-2 py-1 rounded bg-white border border-slate-200 hover:border-medicoral hover:text-medicoral transition font-mono text-[11px]"
              title="Jump virtual clock to 08:00 (triggers full-screen alarm)"
            >
              Test 08:00 Alarm
            </button>
            {isCustomTime && (
              <button
                type="button"
                onClick={resetVirtualTime}
                className="px-2 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 transition text-[11px]"
                title="Reset to live system time"
              >
                Reset Clock
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ReminderAlarm;
