import React, { useState, useEffect } from 'react';
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  FileText,
  Pill,
  Calendar,
  Building2,
  User,
  Clock,
  FlaskConical,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { Card } from '../../shared/Card';
import { StatusBadge } from '../../shared/StatusBadge';
import { useAuth } from '../../auth/AuthContext';
import {
  subscribeToPatientPrescriptions,
  subscribeToPatientReports,
  getHospitals,
  getDoctors,
} from '../../shared/dataService';

export function RecordFolders({
  patientId,
  onSelectRecord,
  title = 'Record Folders',
  className = '',
}) {
  const { currentUser } = useAuth();
  const effectivePatientId =
    patientId ||
    currentUser?.patientId ||
    (currentUser?.role === 'patient' ? currentUser?.uid : null) ||
    'pat-001';

  const [prescriptions, setPrescriptions] = useState([]);
  const [reports, setReports] = useState([]);
  const [hospitalsMap, setHospitalsMap] = useState({});
  const [doctorsMap, setDoctorsMap] = useState({});
  const [loading, setLoading] = useState(true);

  // Expanded folders state: keys are hospitalName or hospitalName__doctorName
  const [expandedHospitals, setExpandedHospitals] = useState({});
  const [expandedDoctors, setExpandedDoctors] = useState({});

  // Active opened record details ID
  const [selectedRecordId, setSelectedRecordId] = useState(null);

  // Load lookup maps for Hospitals and Doctors
  useEffect(() => {
    let mounted = true;
    const loadLookups = async () => {
      try {
        const [hList, dList] = await Promise.all([getHospitals(), getDoctors()]);
        if (!mounted) return;

        const hMap = {};
        (hList || []).forEach((h) => {
          hMap[h.id] = h.name;
        });

        const dMap = {};
        (dList || []).forEach((d) => {
          dMap[d.id] = d.name;
        });

        setHospitalsMap(hMap);
        setDoctorsMap(dMap);
      } catch (e) {
        console.warn('Could not load lookup tables:', e);
      }
    };
    loadLookups();
    return () => {
      mounted = false;
    };
  }, []);

  // Subscribe to patient's prescriptions and reports
  useEffect(() => {
    if (!effectivePatientId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    let rxDone = false;
    let repDone = false;

    const checkDone = () => {
      if (rxDone && repDone) setLoading(false);
    };

    const unsubRx = subscribeToPatientPrescriptions(effectivePatientId, (rxList) => {
      setPrescriptions(rxList || []);
      rxDone = true;
      checkDone();
    });

    const unsubRep = subscribeToPatientReports(effectivePatientId, (repList) => {
      setReports(repList || []);
      repDone = true;
      checkDone();
    });

    return () => {
      if (typeof unsubRx === 'function') unsubRx();
      if (typeof unsubRep === 'function') unsubRep();
    };
  }, [effectivePatientId]);

  // Combine and group records: Hospital -> Doctor -> Dated records
  const tree = React.useMemo(() => {
    const grouped = {};

    // 1. Process prescriptions
    (prescriptions || []).forEach((rx) => {
      const hName = hospitalsMap[rx.hospitalId] || 'MediFlow City Clinic';
      const dName = doctorsMap[rx.doctorId] || 'Dr. Sameer Khan';
      const date = rx.date || 'Unknown Date';

      const medCount = rx.medicines?.length || 0;
      const testCount = rx.tests?.length || 0;

      let summary = 'Prescription record';
      if (medCount > 0 && testCount > 0) {
        summary = `${medCount} medicine${medCount === 1 ? '' : 's'}, ${testCount} test${testCount === 1 ? '' : 's'}`;
      } else if (medCount > 0) {
        summary = `${medCount} medicine${medCount === 1 ? '' : 's'}`;
      } else if (testCount > 0) {
        summary = `${testCount} test${testCount === 1 ? '' : 's'}`;
      }

      const item = {
        id: rx.id || `rx-${Math.random()}`,
        type: 'prescription',
        date,
        summary,
        medicines: rx.medicines || [],
        tests: rx.tests || [],
        hospitalName: hName,
        doctorName: dName,
      };

      if (!grouped[hName]) grouped[hName] = {};
      if (!grouped[hName][dName]) grouped[hName][dName] = [];
      grouped[hName][dName].push(item);
    });

    // 2. Process reports
    (reports || []).forEach((rep) => {
      const hName = hospitalsMap[rep.hospitalId] || 'MediFlow City Clinic';
      const dName = doctorsMap[rep.doctorId] || 'Diagnostic Lab / General';
      const date = rep.date || 'Unknown Date';
      const summary = rep.title ? `Report: ${rep.title}` : 'Diagnostic Health Report';

      const item = {
        id: rep.id || `rep-${Math.random()}`,
        type: 'report',
        date,
        summary,
        title: rep.title || 'Diagnostic Report',
        notes: rep.notes || '',
        hospitalName: hName,
        doctorName: dName,
      };

      if (!grouped[hName]) grouped[hName] = {};
      if (!grouped[hName][dName]) grouped[hName][dName] = [];
      grouped[hName][dName].push(item);
    });

    // Sort records in each doctor folder descending by date
    Object.keys(grouped).forEach((h) => {
      Object.keys(grouped[h]).forEach((d) => {
        grouped[h][d].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      });
    });

    return grouped;
  }, [prescriptions, reports, hospitalsMap, doctorsMap]);

  // Set initial default expanded states when tree loads
  useEffect(() => {
    const hKeys = Object.keys(tree);
    if (hKeys.length > 0) {
      setExpandedHospitals((prev) => {
        const next = { ...prev };
        hKeys.forEach((h) => {
          if (next[h] === undefined) next[h] = true; // default expand
        });
        return next;
      });

      setExpandedDoctors((prev) => {
        const next = { ...prev };
        hKeys.forEach((h) => {
          Object.keys(tree[h] || {}).forEach((d) => {
            const docKey = `${h}__${d}`;
            if (next[docKey] === undefined) next[docKey] = true; // default expand
          });
        });
        return next;
      });
    }
  }, [tree]);

  const toggleHospital = (hName) => {
    setExpandedHospitals((prev) => ({
      ...prev,
      [hName]: !prev[hName],
    }));
  };

  const toggleDoctor = (hName, dName) => {
    const key = `${hName}__${dName}`;
    setExpandedDoctors((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleRecordDetails = (recordId) => {
    setSelectedRecordId((prev) => (prev === recordId ? null : recordId));
  };

  const hospitalNames = Object.keys(tree);
  const totalRecordCount = (prescriptions?.length || 0) + (reports?.length || 0);

  return (
    <Card className={`relative flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-mediteal-light text-mediteal flex items-center justify-center shrink-0">
            <Folder className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500">
              Prescriptions & reports categorized by hospital and physician
            </p>
          </div>
        </div>
        <StatusBadge variant="teal">
          {totalRecordCount} {totalRecordCount === 1 ? 'Record' : 'Records'}
        </StatusBadge>
      </div>

      {/* Loading state */}
      {loading && hospitalNames.length === 0 ? (
        <div className="py-10 text-center text-slate-400 text-sm">
          <div className="w-6 h-6 border-2 border-mediteal border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading patient health folders...
        </div>
      ) : hospitalNames.length === 0 ? (
        /* Empty state */
        <div className="py-10 text-center px-4 rounded-xl border border-dashed border-slate-200 bg-white">
          <Folder className="w-10 h-10 text-slate-300 mx-auto mb-2.5" />
          <h4 className="text-sm font-semibold text-slate-800">No medical records yet</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-[280px] mx-auto">
            Past consultations, doctor prescriptions, and laboratory reports will appear here organized into folders.
          </p>
        </div>
      ) : (
        /* Folder Tree: Hospital -> Doctor -> Dated records */
        <div className="space-y-3">
          {hospitalNames.map((hName) => {
            const isHospExpanded = Boolean(expandedHospitals[hName]);
            const doctors = tree[hName] || {};
            const doctorNames = Object.keys(doctors);
            const hospRecordsCount = doctorNames.reduce(
              (acc, d) => acc + (doctors[d]?.length || 0),
              0
            );

            return (
              <div
                key={hName}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
              >
                {/* Level 1: Hospital Folder Header */}
                <button
                  type="button"
                  onClick={() => toggleHospital(hName)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-50/80 hover:bg-slate-100/80 text-left transition-colors border-b border-slate-200"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span className="text-slate-500">
                      {isHospExpanded ? (
                        <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                      )}
                    </span>
                    <span className="text-mediteal">
                      {isHospExpanded ? (
                        <FolderOpen className="w-5 h-5" />
                      ) : (
                        <Folder className="w-5 h-5" />
                      )}
                    </span>
                    <span className="font-bold text-sm text-slate-900 truncate">
                      {hName}
                    </span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700 shrink-0">
                    {hospRecordsCount} {hospRecordsCount === 1 ? 'item' : 'items'}
                  </span>
                </button>

                {/* Level 2: Doctors under Hospital */}
                {isHospExpanded && (
                  <div className="p-3 space-y-2.5 bg-slate-50/40">
                    {doctorNames.map((dName) => {
                      const docKey = `${hName}__${dName}`;
                      const isDocExpanded = Boolean(expandedDoctors[docKey]);
                      const records = doctors[dName] || [];

                      return (
                        <div
                          key={docKey}
                          className="rounded-lg border border-slate-200 bg-white overflow-hidden"
                        >
                          {/* Doctor Folder Header */}
                          <button
                            type="button"
                            onClick={() => toggleDoctor(hName, dName)}
                            className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white hover:bg-slate-50 text-left transition-colors"
                          >
                            <div className="flex items-center space-x-2 min-w-0">
                              <span className="text-slate-400">
                                {isDocExpanded ? (
                                  <ChevronDown className="w-3.5 h-3.5" />
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5" />
                                )}
                              </span>
                              <div className="w-6 h-6 rounded-md bg-mediteal-light text-mediteal flex items-center justify-center shrink-0">
                                <User className="w-3.5 h-3.5" />
                              </div>
                              <span className="font-semibold text-xs text-slate-800 truncate">
                                {dName}
                              </span>
                            </div>
                            <span className="text-[11px] font-medium text-slate-500">
                              {records.length} {records.length === 1 ? 'record' : 'records'}
                            </span>
                          </button>

                          {/* Level 3: Dated Records List under Doctor */}
                          {isDocExpanded && (
                            <div className="px-3 pb-3 pt-1 space-y-2 border-t border-slate-100">
                              {records.map((rec) => {
                                const isDetailsOpen = selectedRecordId === rec.id;
                                const isRx = rec.type === 'prescription';

                                return (
                                  <div
                                    key={rec.id}
                                    className={`rounded-lg border transition-all ${
                                      isDetailsOpen
                                        ? 'border-mediteal/50 bg-white ring-1 ring-mediteal/30 shadow-sm'
                                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                                    }`}
                                  >
                                    {/* Record Row (Clickable) */}
                                    <div
                                      onClick={() => {
                                        if (typeof onSelectRecord === 'function') {
                                          onSelectRecord(rec);
                                        } else {
                                          toggleRecordDetails(rec.id);
                                        }
                                      }}
                                      className="p-3 flex items-start justify-between gap-3 cursor-pointer select-none"
                                    >
                                      <div className="flex items-start space-x-2.5 min-w-0">
                                        <div
                                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                                            isRx
                                              ? 'bg-mediteal-light text-mediteal'
                                              : 'bg-sky-50 text-sky-700'
                                          }`}
                                        >
                                          {isRx ? (
                                            <Pill className="w-4 h-4" />
                                          ) : (
                                            <FileText className="w-4 h-4" />
                                          )}
                                        </div>
                                        <div className="min-w-0">
                                          <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs font-bold text-slate-900">
                                              {rec.date}
                                            </span>
                                            <span
                                              className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                                                isRx
                                                  ? 'bg-mediteal-light text-mediteal'
                                                  : 'bg-sky-50 text-sky-800'
                                              }`}
                                            >
                                              {isRx ? 'Rx' : 'Report'}
                                            </span>
                                          </div>
                                          {/* One-line summary */}
                                          <p className="text-xs text-slate-600 mt-0.5 truncate font-medium">
                                            {rec.summary}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex items-center space-x-1.5 shrink-0 self-center">
                                        <span className="text-[11px] text-mediteal font-semibold">
                                          {isDetailsOpen ? 'Hide' : 'Details'}
                                        </span>
                                        <span className="text-slate-400">
                                          {isDetailsOpen ? (
                                            <ChevronDown className="w-3.5 h-3.5 text-mediteal" />
                                          ) : (
                                            <ChevronRight className="w-3.5 h-3.5" />
                                          )}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Expanded Details View */}
                                    {isDetailsOpen && (
                                      <div className="px-3.5 pb-3.5 pt-2 border-t border-slate-100 bg-slate-50/60 rounded-b-lg text-xs space-y-3">
                                        {/* Prescription Details */}
                                        {isRx && (
                                          <div>
                                            <div className="font-bold text-slate-800 mb-2 flex items-center gap-1.5 text-xs">
                                              <Pill className="w-3.5 h-3.5 text-mediteal" />
                                              <span>Prescribed Medicines:</span>
                                            </div>

                                            {rec.medicines?.length === 0 ? (
                                              <p className="text-slate-500 italic">No medicines listed.</p>
                                            ) : (
                                              <div className="space-y-2">
                                                {rec.medicines.map((m, idx) => (
                                                  <div
                                                    key={idx}
                                                    className="p-2.5 rounded-lg bg-white border border-slate-200"
                                                  >
                                                    <div className="flex items-center justify-between gap-2">
                                                      <span className="font-bold text-slate-900 text-xs">
                                                        {m.name}
                                                      </span>
                                                      <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                                        {m.dose || '1 dose'}
                                                      </span>
                                                    </div>

                                                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-600 text-[11px]">
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
                                                        <span className="inline-flex items-center gap-1">
                                                          <Clock className="w-3 h-3 text-slate-400" />
                                                          <strong className="font-mono">
                                                            {Array.isArray(m.timings) ? m.timings.join(', ') : m.timings}
                                                          </strong>
                                                        </span>
                                                      )}
                                                    </div>

                                                    {m.remarks && (
                                                      <div className="mt-1.5 text-[11px] text-amber-900 bg-amber-50/70 border border-amber-200/50 px-2 py-1 rounded">
                                                        <strong>Remarks:</strong> {m.remarks}
                                                      </div>
                                                    )}
                                                  </div>
                                                ))}
                                              </div>
                                            )}

                                            {/* Tests in prescription */}
                                            {rec.tests && rec.tests.length > 0 && (
                                              <div className="mt-3 pt-2.5 border-t border-slate-200">
                                                <div className="font-bold text-slate-800 mb-1.5 flex items-center gap-1.5 text-xs">
                                                  <FlaskConical className="w-3.5 h-3.5 text-mediteal" />
                                                  <span>Advised Diagnostic Tests:</span>
                                                </div>
                                                <div className="space-y-1">
                                                  {rec.tests.map((t, tIdx) => (
                                                    <div
                                                      key={tIdx}
                                                      className="flex items-center justify-between p-2 rounded bg-white border border-slate-200 text-[11px]"
                                                    >
                                                      <span className="font-semibold text-slate-800">
                                                        {t.name || t}
                                                      </span>
                                                      {t.date && (
                                                        <span className="font-mono text-slate-500">
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
                                          <div>
                                            <div className="flex items-center justify-between mb-1.5">
                                              <h5 className="font-bold text-slate-900 text-xs">
                                                {rec.title}
                                              </h5>
                                              <span className="font-mono text-[11px] text-slate-500">
                                                {rec.date}
                                              </span>
                                            </div>
                                            <div className="p-3 bg-white rounded-lg border border-slate-200 text-slate-700 whitespace-pre-wrap leading-relaxed text-xs">
                                              {rec.notes || 'No observation notes attached.'}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
