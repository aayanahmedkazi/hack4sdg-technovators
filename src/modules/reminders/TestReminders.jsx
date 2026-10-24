import React, { useState, useEffect, useMemo } from 'react';
import {
  FlaskConical,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle2,
  Plus,
  Building2,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card } from '../../shared/Card';
import { StatusBadge } from '../../shared/StatusBadge';
import { Button } from '../../shared/Button';
import { subscribeToPatientPrescriptions, createPrescription } from '../../shared/dataService';
import { useAuth } from '../../auth/AuthContext';
import { useDemoClock } from './demoClock';

/**
 * Format date string into friendly display, e.g. "Monday, Oct 26, 2026"
 */
function formatDateFriendly(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-').map(Number);
  if (parts.length === 3) {
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  }
  return dateStr;
}

export function TestReminders({ patientId: propPatientId, className = '' }) {
  const { currentUser } = useAuth();
  const { virtualTime, dateString } = useDemoClock();

  // Resolve target patient ID
  const patientId = propPatientId || currentUser?.patientId || (currentUser?.uid === 'demo-patient-001' ? 'pat-001' : 'pat-001');

  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTestName, setNewTestName] = useState('');
  const [showPastTests, setShowPastTests] = useState(false);

  // Subscribe to patient prescriptions
  useEffect(() => {
    if (!patientId) return;

    setLoading(true);
    const unsubscribe = subscribeToPatientPrescriptions(patientId, (rxList) => {
      setPrescriptions(rxList || []);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [patientId]);

  // Calculate today and tomorrow date strings based on virtual demo clock
  const { todayStr, tomorrowStr } = useMemo(() => {
    const today = dateString;
    const tomorrow = new Date(virtualTime);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    return {
      todayStr: today,
      tomorrowStr: `${yyyy}-${mm}-${dd}`,
    };
  }, [virtualTime, dateString]);

  // Extract all tests from all prescriptions
  const { tomorrowTests, upcomingTests, todayTests, pastTests } = useMemo(() => {
    const allTests = [];

    prescriptions.forEach((rx) => {
      (rx.tests || []).forEach((t, idx) => {
        allTests.push({
          id: `${rx.id}_test_${idx}`,
          prescriptionId: rx.id,
          name: t.name || 'Diagnostic Lab Test',
          date: t.date || rx.date,
          hospitalId: rx.hospitalId || 'hospital-city-care',
          doctorId: rx.doctorId || 'doc-001',
        });
      });
    });

    // Sort by scheduled date
    allTests.sort((a, b) => (a.date || '').localeCompare(b.date || ''));

    const tomorrow = allTests.filter((t) => t.date === tomorrowStr);
    const today = allTests.filter((t) => t.date === todayStr);
    const upcoming = allTests.filter((t) => t.date && t.date >= todayStr);
    const past = allTests.filter((t) => t.date && t.date < todayStr);

    return {
      tomorrowTests: tomorrow,
      todayTests: today,
      upcomingTests: upcoming,
      pastTests: past,
    };
  }, [prescriptions, todayStr, tomorrowStr]);

  // Quick helper to schedule a test for tomorrow (for instant demonstration)
  const handleScheduleTestTomorrow = async (name) => {
    const testName = name || newTestName.trim() || 'Complete Blood Count (CBC)';
    const rxPayload = {
      id: `rx_test_gen_${Date.now()}`,
      patientId,
      doctorId: 'doc-001',
      hospitalId: 'hospital-city-care',
      date: todayStr,
      medicines: [],
      tests: [
        {
          name: testName,
          date: tomorrowStr,
        },
      ],
    };

    await createPrescription(rxPayload);
    setNewTestName('');
    setShowAddModal(false);
  };

  return (
    <Card className={`hover:border-slate-300 transition-colors ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3.5 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-mediteal shrink-0">
            <FlaskConical className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Diagnostic Test Reminders
            </h3>
            <p className="text-xs text-slate-500">
              Lab tests and investigations recommended in your prescriptions
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleScheduleTestTomorrow('Complete Blood Count (CBC)')}
          className="self-start sm:self-center px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:border-mediteal hover:text-mediteal transition text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          title="Add a test for tomorrow to test the banner"
        >
          <Plus className="w-3.5 h-3.5" />
          + Test Tomorrow
        </button>
      </div>

      {/* ==============================================================
          "TEST TOMORROW" BANNER (The day before the test)
         ============================================================== */}
      {tomorrowTests.length > 0 && (
        <div className="space-y-3 mb-5">
          {tomorrowTests.map((t) => (
            <div
              key={t.id}
              className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border border-amber-300/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn shadow-sm"
            >
              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-white border border-amber-300 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
                  <AlertCircle className="w-5 h-5 stroke-[2] animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-amber-200 text-amber-900 border border-amber-400">
                      Test Tomorrow
                    </span>
                    <span className="text-xs font-semibold text-amber-800">
                      {formatDateFriendly(t.date)}
                    </span>
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-slate-900 mt-1 tracking-tight">
                    {t.name}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Please prepare as advised (e.g. overnight fasting for blood sugar / lipid panels). Visit the clinic lab by 8:00 AM.
                  </p>
                </div>
              </div>

              <div className="shrink-0 self-end sm:self-center">
                <span className="inline-flex items-center text-xs font-bold text-amber-900 bg-white/80 px-3 py-1.5 rounded-xl border border-amber-200">
                  <Calendar className="w-3.5 h-3.5 mr-1.5 text-amber-700" />
                  Scheduled Tomorrow
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* "TEST TODAY" BANNER (If test is scheduled for today) */}
      {todayTests.length > 0 && (
        <div className="space-y-3 mb-5">
          {todayTests.map((t) => (
            <div
              key={t.id}
              className="p-4 rounded-2xl bg-mediteal-light/70 border border-mediteal/30 flex items-center justify-between gap-3"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-white text-mediteal flex items-center justify-center border border-mediteal/20">
                  <Clock className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-mediteal block">
                    Test Due Today
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">{t.name}</h4>
                </div>
              </div>
              <span className="text-xs font-semibold text-mediteal bg-white px-2.5 py-1 rounded-lg border border-mediteal/20">
                Today
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ==============================================================
          UPCOMING TESTS LIST
         ============================================================== */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2.5">
          Upcoming Scheduled Tests ({upcomingTests.length})
        </span>

        {loading ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Loading scheduled tests...
          </div>
        ) : upcomingTests.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-sm bg-slate-50 rounded-xl border border-slate-200">
            <FlaskConical className="w-8 h-8 text-slate-300 mx-auto mb-2 stroke-[1.5]" />
            <p className="font-medium text-slate-700">No Upcoming Tests Scheduled</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Click "+ Test Tomorrow" above to test the "Test tomorrow" banner.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {upcomingTests.map((test) => {
              const isTomorrow = test.date === tomorrowStr;
              const isToday = test.date === todayStr;

              return (
                <div
                  key={test.id}
                  className={`p-3.5 rounded-xl border transition flex items-center justify-between gap-3 ${
                    isTomorrow
                      ? 'bg-amber-50/50 border-amber-200 shadow-sm'
                      : isToday
                      ? 'bg-mediteal-light/40 border-mediteal/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isTomorrow
                          ? 'bg-amber-100 text-amber-700'
                          : isToday
                          ? 'bg-mediteal-light text-mediteal'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <FlaskConical className="w-4 h-4 stroke-[2]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{test.name}</h4>
                      <p className="text-xs text-slate-500">
                        Date: {formatDateFriendly(test.date)} &bull; Prescribed in Rx: <code className="font-mono text-[11px]">{test.prescriptionId}</code>
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isTomorrow && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        Tomorrow
                      </span>
                    )}
                    {isToday && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-mediteal-light text-mediteal border border-mediteal/30">
                        Today
                      </span>
                    )}
                    {!isTomorrow && !isToday && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        Upcoming
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Past Tests Accordion */}
      {pastTests.length > 0 && (
        <div className="mt-4 pt-3.5 border-t border-slate-200">
          <button
            type="button"
            onClick={() => setShowPastTests(!showPastTests)}
            className="flex items-center justify-between w-full text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            <span>Past Test History ({pastTests.length})</span>
            {showPastTests ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showPastTests && (
            <div className="space-y-2 mt-3">
              {pastTests.map((t) => (
                <div
                  key={t.id}
                  className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between opacity-80"
                >
                  <div>
                    <span className="font-semibold text-slate-800">{t.name}</span>
                    <span className="text-slate-500 block">{formatDateFriendly(t.date)}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Completed</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export default TestReminders;
