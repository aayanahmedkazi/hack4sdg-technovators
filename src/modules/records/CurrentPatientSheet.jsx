import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  MapPin,
  Smartphone,
  UserCheck,
  UserX,
} from 'lucide-react';
import { Card } from '../../shared/Card';
import { StatusBadge } from '../../shared/StatusBadge';
import { getPatient } from '../../shared/dataService';

export function CurrentPatientSheet({ patientId, className = '' }) {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(Boolean(patientId));

  useEffect(() => {
    let mounted = true;

    if (!patientId) {
      setPatient(null);
      setLoading(false);
      return;
    }

    const fetchPatient = async () => {
      try {
        setLoading(true);
        const data = await getPatient(patientId);
        if (mounted) {
          setPatient(data);
        }
      } catch (err) {
        console.warn('Could not load current patient details:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchPatient();

    return () => {
      mounted = false;
    };
  }, [patientId]);

  // Empty state when no patientId is selected
  if (!patientId) {
    return (
      <Card className={`p-6 text-center bg-white border-slate-200 ${className}`}>
        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2.5">
          <UserX className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-bold text-slate-800">No Patient Selected</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-[260px] mx-auto">
          Call the next patient from the queue to view their reception details.
        </p>
      </Card>
    );
  }

  // Loading state
  if (loading) {
    return (
      <Card className={`p-6 bg-white border-slate-200 ${className}`}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-slate-200 rounded w-1/3"></div>
          <div className="h-3 bg-slate-200 rounded w-1/2"></div>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="h-10 bg-slate-100 rounded"></div>
            <div className="h-10 bg-slate-100 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  const name = patient?.name || 'Patient File';
  const age = patient?.age;
  const gender = patient?.gender || 'Patient';
  const phone = patient?.phone || 'Not provided';
  const address = patient?.address || 'Not provided';
  const hasSmartphone = Boolean(patient?.hasSmartphone);
  const registeredBy = patient?.registeredBy || 'Reception Desk';

  return (
    <Card className={`p-5 bg-white border-slate-200 shadow-sm ${className}`}>
      {/* Header: Name and Gender / Age Badge */}
      <div className="flex items-start justify-between gap-3 mb-3.5 pb-3 border-b border-slate-200">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-mediteal-light text-mediteal flex items-center justify-center shrink-0">
            <User className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-slate-900 truncate">
              {name}
            </h3>
            <p className="text-[11px] text-slate-500 font-mono">
              ID: {patientId}
            </p>
          </div>
        </div>

        <StatusBadge variant="teal" className="shrink-0 text-[11px] !py-0.5">
          {gender} {age !== undefined && age !== null ? `• ${age} yrs` : ''}
        </StatusBadge>
      </div>

      {/* Compact Read-Only Patient Details */}
      <div className="space-y-2 text-xs">
        {/* Phone */}
        <div className="flex items-center justify-between py-1 border-b border-slate-100">
          <span className="text-slate-500 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            Phone
          </span>
          <span className="font-mono font-bold text-slate-800">
            {phone}
          </span>
        </div>

        {/* Has a smartphone */}
        <div className="flex items-center justify-between py-1 border-b border-slate-100">
          <span className="text-slate-500 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-slate-400" />
            Smartphone
          </span>
          <span
            className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
              hasSmartphone
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {hasSmartphone ? 'Yes' : 'No'}
          </span>
        </div>

        {/* Address */}
        <div className="py-1 border-b border-slate-100">
          <div className="flex items-start justify-between gap-2">
            <span className="text-slate-500 flex items-center gap-1.5 shrink-0">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Address
            </span>
            <span className="text-slate-700 text-right text-xs truncate max-w-[200px]" title={address}>
              {address}
            </span>
          </div>
        </div>

        {/* Registered by */}
        <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <UserCheck className="w-3 h-3 text-slate-400" />
            Entered by receptionist
          </span>
          <span className="font-medium text-slate-600 truncate max-w-[140px]">
            {registeredBy}
          </span>
        </div>
      </div>
    </Card>
  );
}
