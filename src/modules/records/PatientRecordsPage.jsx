import React, { useState } from 'react';
import {
  FilePlus,
  CheckCircle2,
  AlertCircle,
  FileText,
  Plus,
  Calendar,
  Building,
} from 'lucide-react';
import { Card } from '../../shared/Card';
import { Button } from '../../shared/Button';
import { StatusBadge } from '../../shared/StatusBadge';
import { useAuth } from '../../auth/AuthContext';
import { createReport } from '../../shared/dataService';
import { RecordFolders } from './RecordFolders';

export function PatientRecordsPage({ patientId, onlyForm = false, className = '' }) {
  const { currentUser } = useAuth();
  const effectivePatientId =
    patientId ||
    currentUser?.patientId ||
    (currentUser?.role === 'patient' ? currentUser?.uid : null) ||
    'pat-001';

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const trimmedTitle = title.trim();
    const trimmedNotes = notes.trim();

    if (!trimmedTitle) {
      setError('Please provide a title for the report (e.g. Blood Test, Chest X-Ray).');
      return;
    }

    if (!trimmedNotes) {
      setError('Please enter notes or findings for this report.');
      return;
    }

    setLoading(true);

    try {
      const today = new Date().toISOString().slice(0, 10);
      const payload = {
        patientId: effectivePatientId,
        title: trimmedTitle,
        notes: trimmedNotes,
        date: today,
        hospitalId: 'hospital-main',
        doctorId: 'doc-001',
      };

      const saved = await createReport(payload);

      setSuccess(true);
      setTitle('');
      setNotes('');

      // Dispatch event to notify listeners
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mediflow:report-added', { detail: saved }));
      }
    } catch (err) {
      console.error('Error adding report:', err);
      setError(err.message || 'Failed to save the report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 1. Simple "Add a report" form card */}
      <Card className="relative">
        <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-mediteal-light text-mediteal flex items-center justify-center shrink-0">
              <FilePlus className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Add a Medical Report</h3>
              <p className="text-xs text-slate-500">
                Attach lab tests, blood work, or outside clinic summaries to your records
              </p>
            </div>
          </div>
          <StatusBadge variant="neutral">New Report</StatusBadge>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-2.5 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-900">Report added successfully!</p>
              <p className="text-emerald-700 mt-0.5">
                The report has been saved to your health folder.
              </p>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Report Title <span className="text-medicoral">*</span>
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Complete Blood Count (CBC) or Chest X-Ray Report"
                disabled={loading}
                className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-mediteal focus:ring-1 focus:ring-mediteal text-sm transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Notes & Observations <span className="text-medicoral">*</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Hemoglobin 14.2 g/dL, Platelets 220,000. Doctor advised normal diet and hydration."
              disabled={loading}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-mediteal focus:ring-1 focus:ring-mediteal text-sm transition-colors"
            />
          </div>

          <div className="pt-1">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading}
              icon={Plus}
              className="!py-2.5 font-bold text-sm"
            >
              {loading ? 'Saving Report...' : 'Save Report to Folders'}
            </Button>
          </div>
        </form>
      </Card>

      {/* 2. Own RecordFolders view */}
      {!onlyForm && (
        <div>
          <RecordFolders patientId={effectivePatientId} />
        </div>
      )}
    </div>
  );
}
