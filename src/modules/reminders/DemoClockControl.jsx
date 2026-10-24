import React, { useState, useEffect } from 'react';
import {
  Clock,
  FastForward,
  RotateCcw,
  SkipForward,
  Sparkles,
  Check,
  Calendar,
} from 'lucide-react';
import { Card } from '../../shared/Card';
import { Button } from '../../shared/Button';
import { useDemoClock } from './demoClock';
import { subscribeToDoseLogs } from '../../shared/dataService';
import { useAuth } from '../../auth/AuthContext';

export function DemoClockControl({ patientId: propPatientId, className = '' }) {
  const { currentUser } = useAuth();
  const patientId = propPatientId || currentUser?.patientId || (currentUser?.uid === 'demo-patient-001' ? 'pat-001' : 'pat-001');

  const {
    virtualTime,
    formattedTime,
    time24,
    dateString,
    isCustomTime,
    setVirtualTime,
    addVirtualMinutes,
    resetVirtualTime,
  } = useDemoClock();

  const [inputTime, setInputTime] = useState(time24);
  const [doses, setDoses] = useState([]);
  const [jumpFeedback, setJumpFeedback] = useState(null);

  // Sync input time when virtual clock changes
  useEffect(() => {
    setInputTime(time24);
  }, [time24]);

  // Load doses to support "Jump to next dose"
  useEffect(() => {
    if (!patientId) return;
    const unsubscribe = subscribeToDoseLogs(patientId, (allLogs) => {
      setDoses(allLogs || []);
    });
    return () => unsubscribe();
  }, [patientId]);

  // Handle manual fake time submit
  const handleApplyTime = (e) => {
    e.preventDefault();
    if (!inputTime) return;
    setVirtualTime(inputTime);
    setJumpFeedback(`Set time to ${inputTime}`);
    setTimeout(() => setJumpFeedback(null), 2500);
  };

  // Handle "Jump to next dose" button
  const handleJumpToNextDose = () => {
    const nowMs = virtualTime.getTime();
    const todayStr = dateString;

    // Filter pending doses
    const pendingDoses = doses.filter((d) => d.status === 'pending');

    if (pendingDoses.length === 0) {
      setJumpFeedback('No pending doses found to jump to.');
      setTimeout(() => setJumpFeedback(null), 2500);
      return;
    }

    // Parse doses and find the next pending dose in chronological order
    const parsed = pendingDoses.map((d) => {
      let dDate;
      if (d.scheduledTime && d.scheduledTime.includes('-') && d.scheduledTime.includes(':')) {
        const [datePart, timePart] = d.scheduledTime.split(' ');
        const [y, m, day] = datePart.split('-').map(Number);
        const [hh, mm] = timePart.split(':').map(Number);
        dDate = new Date(y, m - 1, day, hh, mm, 0, 0);
      } else if (d.scheduledTime && d.scheduledTime.includes(':')) {
        const [hh, mm] = d.scheduledTime.split(':').map(Number);
        const [y, m, day] = todayStr.split('-').map(Number);
        dDate = new Date(y, m - 1, day, hh, mm, 0, 0);
      } else {
        dDate = new Date();
      }
      return { ...d, dateObj: dDate };
    });

    // Sort chronologically
    parsed.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

    // 1. Look for the next upcoming pending dose (after current virtual time)
    let nextDose = parsed.find((d) => d.dateObj.getTime() > nowMs);

    // 2. If all pending doses are in the past or right now, jump to the first pending dose
    if (!nextDose) {
      nextDose = parsed[0];
    }

    if (nextDose) {
      const hh = String(nextDose.dateObj.getHours()).padStart(2, '0');
      const mm = String(nextDose.dateObj.getMinutes()).padStart(2, '0');
      setVirtualTime(`${hh}:${mm}`);
      setJumpFeedback(`Jumped to next dose: ${nextDose.medicineName} (${hh}:${mm})`);
      setTimeout(() => setJumpFeedback(null), 3000);
    }
  };

  return (
    <Card className={`p-4 sm:p-5 hover:border-slate-300 transition-colors ${className}`}>
      {/* Small Header */}
      <div className="flex items-center justify-between gap-3 mb-3 pb-2.5 border-b border-slate-200">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-mediteal-light text-mediteal flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              Virtual Demo Clock
              {isCustomTime && (
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                  Fake Time
                </span>
              )}
            </h4>
          </div>
        </div>

        {/* Current Time Readout */}
        <div className="text-right">
          <div className="text-base font-extrabold font-mono text-slate-900">
            {formattedTime}
          </div>
        </div>
      </div>

      {/* Main Controls Row */}
      <div className="space-y-3">
        {/* Set Fake Current Time Input */}
        <form onSubmit={handleApplyTime} className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="time"
              value={inputTime}
              onChange={(e) => setInputTime(e.target.value)}
              className="w-full h-9 px-3 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-mediteal"
              title="Set fake current time"
            />
          </div>
          <Button
            type="submit"
            variant="secondary"
            size="small"
            className="!h-9 !px-3 text-xs font-semibold"
          >
            Set Time
          </Button>
        </form>

        {/* Required Buttons: "+15 min" and "Jump to next dose" */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="secondary"
            size="small"
            icon={FastForward}
            onClick={() => addVirtualMinutes(15)}
            className="w-full !h-9 text-xs font-bold"
          >
            +15 min
          </Button>

          <Button
            type="button"
            variant="primary"
            size="small"
            icon={SkipForward}
            onClick={handleJumpToNextDose}
            className="w-full !h-9 text-xs font-bold"
            title="Fast forward clock directly to next pending medicine dose"
          >
            Jump to next dose
          </Button>
        </div>

        {/* Reset Button & Presets */}
        <div className="flex items-center justify-between text-xs pt-1">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setVirtualTime('07:45')}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono transition"
              title="15 min before dose (Quiet Banner)"
            >
              07:45
            </button>
            <button
              type="button"
              onClick={() => setVirtualTime('08:00')}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono transition"
              title="At dose time (Alarm Popup)"
            >
              08:00
            </button>
            <button
              type="button"
              onClick={() => setVirtualTime('08:35')}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono transition"
              title="35 mins after (Mark Missed)"
            >
              08:35
            </button>
          </div>

          {isCustomTime && (
            <button
              type="button"
              onClick={resetVirtualTime}
              className="text-xs text-slate-400 hover:text-slate-700 underline transition"
            >
              Reset Live
            </button>
          )}
        </div>

        {/* Jump Feedback Message */}
        {jumpFeedback && (
          <div className="p-2 rounded-lg bg-mediteal-light text-mediteal text-[11px] font-semibold flex items-center gap-1.5 animate-fadeIn">
            <Check className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
            <span>{jumpFeedback}</span>
          </div>
        )}
      </div>
    </Card>
  );
}

export default DemoClockControl;
