import React, { useState, useEffect } from 'react';
import {
  Pill,
  Plus,
  Trash2,
  Clock,
  FlaskConical,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Sparkles,
  UserX,
  Check,
} from 'lucide-react';
import { Card } from '../../shared/Card';
import { Button } from '../../shared/Button';
import { StatusBadge } from '../../shared/StatusBadge';
import { useAuth } from '../../auth/AuthContext';
import { createPrescription } from '../../shared/dataService';

const DEFAULT_TIMINGS = {
  1: ['08:00'],
  2: ['08:00', '20:00'],
  3: ['08:00', '14:00', '20:00'],
  4: ['08:00', '12:00', '16:00', '20:00'],
};

const COMMON_REMARKS = [
  'empty stomach',
  'after food',
  'before sleep',
  'with warm water',
];

export function PrescriptionForm({ patientId, onSaved, className = '' }) {
  const { currentUser } = useAuth();

  // Medicines state: doctor enters ONLY prescribed medicines
  const [medicines, setMedicines] = useState([
    {
      id: 1,
      name: '',
      dose: '1 tablet',
      timesPerDay: 2,
      timings: ['08:00', '20:00'],
      durationDays: 3,
      remarks: 'after food',
    },
  ]);

  // Optional Tests list
  const [tests, setTests] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Clear form when patientId changes (e.g. when doctor presses Next)
  useEffect(() => {
    setMedicines([
      {
        id: Date.now(),
        name: '',
        dose: '1 tablet',
        timesPerDay: 2,
        timings: ['08:00', '20:00'],
        durationDays: 3,
        remarks: 'after food',
      },
    ]);
    setTests([]);
    setSavedSuccess(false);
    setError('');
  }, [patientId]);

  // Empty state when patientId is null
  if (!patientId) {
    return (
      <Card
        className={`min-h-[580px] flex flex-col items-center justify-center text-center p-8 bg-white border-slate-200 ${className}`}
      >
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
          <Pill className="w-6 h-6 stroke-[1.75]" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No Patient Selected</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          Call or select a patient from the queue to begin writing their prescription.
        </p>
      </Card>
    );
  }

  // Medicine row modifiers
  const handleMedicineChange = (id, field, value) => {
    setMedicines((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;

        // If timesPerDay changed, adjust timings array accordingly
        if (field === 'timesPerDay') {
          const times = parseInt(value, 10) || 1;
          const newTimings =
            DEFAULT_TIMINGS[times] ||
            Array.from({ length: times }, (_, i) => `${String(8 + i * 4).padStart(2, '0')}:00`);
          return { ...m, timesPerDay: times, timings: newTimings };
        }

        return { ...m, [field]: value };
      })
    );
    if (error) setError('');
  };

  const handleTimingChange = (medId, timingIndex, newTime) => {
    setMedicines((prev) =>
      prev.map((m) => {
        if (m.id !== medId) return m;
        const updatedTimings = [...m.timings];
        updatedTimings[timingIndex] = newTime;
        return { ...m, timings: updatedTimings };
      })
    );
  };

  const addMedicineRow = () => {
    setMedicines((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: '',
        dose: '1 tablet',
        timesPerDay: 2,
        timings: ['08:00', '20:00'],
        durationDays: 3,
        remarks: 'after food',
      },
    ]);
  };

  const removeMedicineRow = (id) => {
    if (medicines.length <= 1) {
      setMedicines([
        {
          id: Date.now(),
          name: '',
          dose: '1 tablet',
          timesPerDay: 2,
          timings: ['08:00', '20:00'],
          durationDays: 3,
          remarks: 'after food',
        },
      ]);
      return;
    }
    setMedicines((prev) => prev.filter((m) => m.id !== id));
  };

  // Diagnostic tests modifiers
  const addTestRow = () => {
    setTests((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: '',
        date: new Date().toISOString().slice(0, 10),
      },
    ]);
  };

  const handleTestChange = (id, field, value) => {
    setTests((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const removeTestRow = (id) => {
    setTests((prev) => prev.filter((t) => t.id !== id));
  };

  // Submit and save prescription
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Filter valid medicines
    const validMedicines = medicines
      .map((m) => ({
        name: m.name.trim(),
        dose: m.dose.trim() || '1 dose',
        timesPerDay: parseInt(m.timesPerDay, 10) || 1,
        timings: m.timings && m.timings.length > 0 ? m.timings : ['08:00'],
        durationDays: parseInt(m.durationDays, 10) || 1,
        remarks: m.remarks.trim(),
      }))
      .filter((m) => m.name.length > 0);

    if (validMedicines.length === 0) {
      setError('Please add at least one medicine with a name.');
      return;
    }

    const validTests = tests
      .map((t) => ({
        name: t.name.trim(),
        date: t.date || new Date().toISOString().slice(0, 10),
      }))
      .filter((t) => t.name.length > 0);

    setLoading(true);

    try {
      const today = new Date().toISOString().slice(0, 10);
      const doctorId = currentUser?.doctorId || currentUser?.uid || 'doc-001';
      const hospitalId = currentUser?.hospitalId || 'hospital-main';

      const rxPayload = {
        patientId,
        doctorId,
        hospitalId,
        date: today,
        medicines: validMedicines,
        tests: validTests,
        createdAt: new Date().toISOString(),
      };

      const saved = await createPrescription(rxPayload);

      // Keep saved sheet visible and show success message
      setSavedSuccess(true);

      // Call onSaved callback if provided
      if (typeof onSaved === 'function') {
        onSaved(saved);
      }

      // Notify other listeners
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('mediflow:prescription-added', { detail: saved })
        );
      }
    } catch (err) {
      console.error('Failed to save prescription:', err);
      setError(err.message || 'Failed to save prescription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={`min-h-[640px] flex flex-col justify-between relative bg-white border-slate-200 shadow-sm ${className}`}>
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5 pb-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-mediteal-light text-mediteal flex items-center justify-center shrink-0">
              <Pill className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Doctor Prescription</h3>
              <p className="text-xs text-slate-500">
                Prescribe medicines, dosage schedule, and diagnostic tests
              </p>
            </div>
          </div>
          <StatusBadge variant={savedSuccess ? 'teal' : 'neutral'}>
            {savedSuccess ? 'Prescription Saved' : 'Prescribing'}
          </StatusBadge>
        </div>

        {/* Success Notification Banner (Kept visible until Next is clicked) */}
        {savedSuccess && (
          <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-bold text-sm text-emerald-900">
                  Saved. Reminders will start automatically
                </h4>
                <p className="text-xs text-emerald-700 mt-0.5">
                  The prescription has been recorded in the database. When you click <strong>Next Patient</strong>, this form will reset for the new patient.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-medicoral-light border border-medicoral/25 text-medicoral text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form id="rx-form" onSubmit={handleSubmit} className="space-y-6">
          {/* ==============================================================
              SECTION 1: MEDICINES LIST
             ============================================================== */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5 text-mediteal" />
                Prescribed Medicines <span className="text-medicoral">*</span>
              </label>
              <button
                type="button"
                onClick={addMedicineRow}
                className="inline-flex items-center gap-1 text-xs font-bold text-mediteal hover:text-mediteal-hover transition-colors"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                Add medicine
              </button>
            </div>

            <div className="space-y-3.5">
              {medicines.map((med, index) => (
                <div
                  key={med.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-sm space-y-3 relative group"
                >
                  {/* Top Row: Medicine Name & Dose & Remove */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0 mt-2">
                      {index + 1}
                    </div>

                    {/* Medicine Name */}
                    <div className="flex-1">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Medicine Name *
                      </label>
                      <input
                        type="text"
                        value={med.name}
                        onChange={(e) =>
                          handleMedicineChange(med.id, 'name', e.target.value)
                        }
                        placeholder="e.g. Paracetamol 500mg, Amoxicillin 250mg"
                        disabled={loading}
                        required
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-mediteal focus:ring-1 focus:ring-mediteal text-sm font-medium transition-colors"
                      />
                    </div>

                    {/* Dose */}
                    <div className="w-28 sm:w-32">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Dose *
                      </label>
                      <input
                        type="text"
                        value={med.dose}
                        onChange={(e) =>
                          handleMedicineChange(med.id, 'dose', e.target.value)
                        }
                        placeholder="1 tablet"
                        disabled={loading}
                        required
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-mediteal focus:ring-1 focus:ring-mediteal text-sm transition-colors"
                      />
                    </div>

                    {/* Remove Button */}
                    <div className="pt-6">
                      <button
                        type="button"
                        onClick={() => removeMedicineRow(med.id)}
                        title="Remove medicine"
                        disabled={loading}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-medicoral hover:bg-medicoral-light/50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Second Row: Times Per Day & Duration in Days */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-8">
                    {/* Times per day */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Times per day
                      </label>
                      <select
                        value={med.timesPerDay}
                        onChange={(e) =>
                          handleMedicineChange(med.id, 'timesPerDay', e.target.value)
                        }
                        disabled={loading}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-mediteal focus:ring-1 focus:ring-mediteal text-xs font-medium transition-colors"
                      >
                        <option value="1">1 time a day (Once daily)</option>
                        <option value="2">2 times a day (Twice daily)</option>
                        <option value="3">3 times a day (Thrice daily)</option>
                        <option value="4">4 times a day (Four times)</option>
                      </select>
                    </div>

                    {/* Duration in Days */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Duration in days
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max="365"
                          value={med.durationDays}
                          onChange={(e) =>
                            handleMedicineChange(med.id, 'durationDays', e.target.value)
                          }
                          disabled={loading}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-mediteal focus:ring-1 focus:ring-mediteal text-xs font-medium transition-colors"
                        />
                        <span className="text-xs text-slate-500 whitespace-nowrap">days</span>
                      </div>
                    </div>
                  </div>

                  {/* Third Row: Timings (Time Pickers) */}
                  <div className="pl-8 pt-1">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Timings (Time pickers)
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      {med.timings.map((time, tIdx) => (
                        <div key={tIdx} className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            Dose {tIdx + 1}:
                          </span>
                          <input
                            type="time"
                            value={time}
                            onChange={(e) =>
                              handleTimingChange(med.id, tIdx, e.target.value)
                            }
                            disabled={loading}
                            className="bg-transparent text-xs font-mono font-semibold text-slate-800 focus:outline-none cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Fourth Row: Remarks */}
                  <div className="pl-8 pt-1">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Remarks (e.g. "empty stomach")
                    </label>
                    <input
                      type="text"
                      value={med.remarks}
                      onChange={(e) =>
                        handleMedicineChange(med.id, 'remarks', e.target.value)
                      }
                      placeholder="e.g. empty stomach, take after food, before sleep"
                      disabled={loading}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-mediteal focus:ring-1 focus:ring-mediteal text-xs transition-colors"
                    />
                    {/* Quick remarks suggestions */}
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {COMMON_REMARKS.map((rem) => (
                        <button
                          key={rem}
                          type="button"
                          onClick={() => handleMedicineChange(med.id, 'remarks', rem)}
                          disabled={loading}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition-colors"
                        >
                          +{rem}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-2 text-right">
              <button
                type="button"
                onClick={addMedicineRow}
                className="inline-flex items-center gap-1 text-xs font-bold text-mediteal hover:text-mediteal-hover transition-colors"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                Add another medicine
              </button>
            </div>
          </div>

          {/* ==============================================================
              SECTION 2: OPTIONAL TESTS LIST
             ============================================================== */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FlaskConical className="w-3.5 h-3.5 text-mediteal" />
                Diagnostic Tests (Optional)
              </label>
              <button
                type="button"
                onClick={addTestRow}
                className="inline-flex items-center gap-1 text-xs font-bold text-mediteal hover:text-mediteal-hover transition-colors"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                Add test
              </button>
            </div>

            {tests.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                No diagnostic tests added. Click "Add test" if blood tests or scans are required.
              </p>
            ) : (
              <div className="space-y-2.5">
                {tests.map((test) => (
                  <div
                    key={test.id}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <div className="flex-1">
                      <input
                        type="text"
                        value={test.name}
                        onChange={(e) =>
                          handleTestChange(test.id, 'name', e.target.value)
                        }
                        placeholder="Test name (e.g. CBC Blood Count, Lipid Profile)"
                        disabled={loading}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none focus:border-mediteal focus:ring-1 focus:ring-mediteal transition-colors"
                      />
                    </div>

                    <div className="w-36">
                      <input
                        type="date"
                        value={test.date}
                        onChange={(e) =>
                          handleTestChange(test.id, 'date', e.target.value)
                        }
                        disabled={loading}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs font-mono focus:outline-none focus:border-mediteal focus:ring-1 focus:ring-mediteal transition-colors"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeTestRow(test.id)}
                      title="Remove test"
                      disabled={loading}
                      className="p-1 rounded-lg text-slate-400 hover:text-medicoral transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>
      </div>

      {/* ==============================================================
          BIG SAVE BUTTON
         ============================================================== */}
      <div className="pt-6 border-t border-slate-200 mt-6">
        <Button
          type="submit"
          form="rx-form"
          variant="primary"
          size="large"
          fullWidth
          disabled={loading}
          className="!py-4 !text-lg !font-bold shadow-sm"
        >
          {loading ? 'Saving Prescription...' : savedSuccess ? 'Saved ✓ (Press Next for next patient)' : 'Save Prescription'}
        </Button>
      </div>
    </Card>
  );
}
