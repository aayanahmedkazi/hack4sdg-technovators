import React, { useState, useEffect } from 'react';
import { Search, Phone, MapPin, Smartphone, Check, X, Users, AlertCircle } from 'lucide-react';
import { Card } from '../../shared/Card';
import { Button } from '../../shared/Button';
import { StatusBadge } from '../../shared/StatusBadge';
import { searchPatients } from '../../shared/dataService';

export function PatientSearch({ onSelect, selectedPatientId, className = '' }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSelectedId, setActiveSelectedId] = useState(selectedPatientId || null);

  const fetchPatients = async (query = '') => {
    try {
      setLoading(true);
      setError('');
      const results = await searchPatients(query);
      setPatients(results || []);
    } catch (err) {
      console.error('Failed to search patients:', err);
      setError('Could not load patients list.');
    } finally {
      setLoading(false);
    }
  };

  // Initial load and on search query change
  useEffect(() => {
    fetchPatients(searchTerm);
  }, [searchTerm]);

  // Sync selectedPatientId prop if updated externally
  useEffect(() => {
    if (selectedPatientId !== undefined) {
      setActiveSelectedId(selectedPatientId);
    }
  }, [selectedPatientId]);

  // Listen for registration events so newly registered patients appear immediately
  useEffect(() => {
    const handlePatientRegistered = () => {
      fetchPatients(searchTerm);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('mediflow:patient-registered', handlePatientRegistered);
      return () => {
        window.removeEventListener('mediflow:patient-registered', handlePatientRegistered);
      };
    }
  }, [searchTerm]);

  const handlePickPatient = (patient) => {
    setActiveSelectedId(patient.id);
    if (typeof onSelect === 'function') {
      onSelect(patient.id, patient);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <Card className={`relative flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-mediteal-light text-mediteal flex items-center justify-center shrink-0">
            <Search className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Find Patient</h3>
            <p className="text-xs text-slate-500">
              Lookup existing outpatient files by name or phone
            </p>
          </div>
        </div>
        <StatusBadge variant="teal">
          {patients.length} {patients.length === 1 ? 'Patient' : 'Patients'}
        </StatusBadge>
      </div>

      {/* Search Input Box */}
      <div className="mb-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or phone (e.g. Aarav, 98765)..."
            className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-mediteal focus:ring-1 focus:ring-mediteal text-sm transition-colors"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Selected Notice (if one is currently picked) */}
      {activeSelectedId && (
        <div className="mb-3 px-3 py-1.5 rounded-lg bg-mediteal-light/50 border border-mediteal/20 text-xs text-mediteal flex items-center justify-between">
          <span>Active Selection: <strong>{patients.find((p) => p.id === activeSelectedId)?.name || activeSelectedId}</strong></span>
          <span className="font-mono text-[11px]">ID: {activeSelectedId}</span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="mb-3 p-3 rounded-xl bg-medicoral-light border border-medicoral/25 text-medicoral text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results List */}
      <div className="flex-1 overflow-y-auto max-h-[440px] space-y-2.5 pr-0.5">
        {loading && patients.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            <div className="w-6 h-6 border-2 border-mediteal border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Searching patient directory...
          </div>
        ) : patients.length === 0 ? (
          <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate-200 bg-white">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No patients found</p>
            <p className="text-xs text-slate-500 mt-1 max-w-[240px] mx-auto">
              {searchTerm
                ? `No patient records match "${searchTerm}". Check spelling or register on the right.`
                : 'No patients in the directory yet. Register a patient to start.'}
            </p>
          </div>
        ) : (
          patients.map((patient) => {
            const isSelected = activeSelectedId === patient.id;
            return (
              <div
                key={patient.id}
                onClick={() => handlePickPatient(patient)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'border-mediteal bg-white ring-2 ring-mediteal shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-900 text-sm truncate">
                        {patient.name}
                      </h4>
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {patient.gender || 'Unknown'} {patient.age ? `• ${patient.age} yrs` : ''}
                      </span>
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                      <div className="flex items-center gap-1 font-mono">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{patient.phone || 'No phone'}</span>
                      </div>

                      {patient.address && (
                        <div className="flex items-center gap-1 text-slate-500 truncate max-w-[200px]" title={patient.address}>
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{patient.address}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                          patient.hasSmartphone
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Smartphone className="w-3 h-3" />
                        {patient.hasSmartphone ? 'Smartphone: Yes' : 'Smartphone: No'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        ID: {patient.id}
                      </span>
                    </div>
                  </div>

                  {/* Pick / Select Button */}
                  <div className="shrink-0 self-center">
                    <Button
                      type="button"
                      size="small"
                      variant={isSelected ? 'primary' : 'secondary'}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePickPatient(patient);
                      }}
                      className="!min-h-[34px] !text-xs !px-3"
                    >
                      {isSelected ? (
                        <span className="inline-flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          Selected
                        </span>
                      ) : (
                        'Select'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
