import React, { useState, useEffect, useRef } from 'react';
import {
  Ticket,
  User,
  Phone,
  ChevronDown,
  Check,
  Info,
  AlertCircle,
  Stethoscope,
  Search,
} from 'lucide-react';
import { getDoctors, createToken } from '../../shared/dataService';

export function BookTokenPage({
  onTokenBooked,
  defaultDoctorId = 'doc-001',
  defaultPatientName = 'Aarav Sharma',
  defaultPhone = '+91 98765 43210',
  className = '',
}) {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isDoctorDropdownOpen, setIsDoctorDropdownOpen] = useState(false);
  const [dropdownFilter, setDropdownFilter] = useState('');

  const [patientName, setPatientName] = useState(defaultPatientName);
  const [phone, setPhone] = useState(defaultPhone);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const dropdownRef = useRef(null);

  // Load doctors from dataService on mount
  useEffect(() => {
    let isMounted = true;
    async function loadDoctors() {
      try {
        const list = await getDoctors();
        if (isMounted && Array.isArray(list) && list.length > 0) {
          setDoctors(list);
          const initial = list.find((d) => d.id === defaultDoctorId) || list[0];
          setSelectedDoctor(initial);
        }
      } catch (err) {
        console.error('Failed to load doctors in BookTokenPage:', err);
      }
    }
    loadDoctors();
    return () => {
      isMounted = false;
    };
  }, [defaultDoctorId]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDoctorDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter doctors in dropdown if filter text is provided
  const filterQuery = dropdownFilter.trim().toLowerCase();
  const filteredDoctors = filterQuery
    ? doctors.filter(
        (doc) =>
          doc.name?.toLowerCase().includes(filterQuery) ||
          doc.speciality?.toLowerCase().includes(filterQuery)
      )
    : doctors;

  const currentDoctor = selectedDoctor || {
    id: 'doc-001',
    name: 'Dr. Sameer Khan',
    speciality: 'Cardiology',
    room: 'Room 1',
    status: 'On Duty',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientName.trim()) {
      setFeedback({ type: 'error', message: 'Please enter patient full name.' });
      return;
    }
    if (!phone.trim()) {
      setFeedback({ type: 'error', message: 'Please enter mobile phone number.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      // Create token in store
      const newTok = await createToken({
        doctorId: currentDoctor.id,
        patientId: 'pat-001',
        source: 'online',
        status: 'waiting',
      });

      setFeedback({
        type: 'success',
        message: `Token confirmed for ${currentDoctor.name} (${currentDoctor.room})! SMS confirmation sent.`,
      });

      if (onTokenBooked) {
        onTokenBooked({
          doctor: currentDoctor,
          patientName,
          phone,
          token: newTok,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      }

      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      console.error('Error creating token:', err);
      setFeedback({
        type: 'error',
        message: 'Could not book token. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 flex flex-col justify-between space-y-6 ${className}`}
    >
      {/* Header with Ticket Icon */}
      <div className="flex items-start space-x-3.5">
        <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-100/80 flex items-center justify-center text-mediteal shrink-0">
          <Ticket className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Book a Clinic Token
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Take a token for today's outpatient clinic.
          </p>
        </div>
      </div>

      {/* Booking Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Field 1: Select Doctor & Room (Matching original screenshot) */}
        <div className="relative" ref={dropdownRef}>
          <label className="block text-xs font-bold text-slate-700 tracking-wide mb-1.5">
            Select Doctor & Room
          </label>
          <button
            type="button"
            onClick={() => setIsDoctorDropdownOpen(!isDoctorDropdownOpen)}
            className="w-full border border-slate-200 rounded-xl p-3 bg-white flex items-center justify-between text-left hover:border-mediteal transition-colors focus:outline-none focus:ring-1 focus:ring-mediteal"
          >
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                <User className="w-4 h-4 stroke-[2]" />
              </div>
              <div className="truncate">
                <div className="text-sm font-bold text-slate-900 leading-tight">
                  {currentDoctor.name}
                </div>
                <div className="text-xs text-slate-500">
                  {currentDoctor.speciality} &bull; {currentDoctor.room}
                </div>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                isDoctorDropdownOpen ? 'rotate-180 text-mediteal' : ''
              }`}
            />
          </button>

          {/* Doctor Dropdown Menu */}
          {isDoctorDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden divide-y divide-slate-100 max-h-72 overflow-y-auto">
              {/* Optional Quick search within dropdown */}
              {doctors.length > 3 && (
                <div className="p-2 bg-slate-50/80 sticky top-0 z-10 border-b border-slate-100">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={dropdownFilter}
                      onChange={(e) => setDropdownFilter(e.target.value)}
                      placeholder="Search doctor or speciality..."
                      className="w-full pl-8 pr-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-mediteal"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              )}

              {filteredDoctors.map((doc) => {
                const isSelected = doc.id === currentDoctor.id;
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => {
                      setSelectedDoctor(doc);
                      setIsDoctorDropdownOpen(false);
                      setDropdownFilter('');
                    }}
                    className={`w-full p-3 flex items-center justify-between text-left hover:bg-slate-50 transition-colors ${
                      isSelected ? 'bg-teal-50/70' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-mediteal text-white' : 'bg-teal-100/70 text-mediteal'
                        }`}
                      >
                        <Stethoscope className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{doc.name}</div>
                        <div className="text-xs text-slate-500">
                          {doc.speciality} &bull; {doc.room}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {doc.status || 'On Duty'}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-mediteal stroke-[2.5]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Field 2: Patient Full Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 tracking-wide mb-1.5">
            Patient Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4 stroke-[2]" />
            </div>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="e.g. Aarav Sharma"
              className="w-full border border-slate-200 rounded-xl py-3 pl-10 pr-3.5 text-sm font-semibold text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-mediteal focus:ring-1 focus:ring-mediteal transition-colors"
              required
            />
          </div>
        </div>

        {/* Field 3: Mobile Phone (for SMS alerts) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 tracking-wide mb-1.5">
            Mobile Phone (for SMS alerts)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Phone className="w-4 h-4 stroke-[2]" />
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full border border-slate-200 rounded-xl py-3 pl-10 pr-3.5 text-sm font-semibold text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-mediteal focus:ring-1 focus:ring-mediteal transition-colors"
              required
            />
          </div>
        </div>

        {/* Feedback message */}
        {feedback && (
          <div
            className={`p-3 rounded-xl text-xs font-medium flex items-center space-x-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Action Button: Confirm & Take Token */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#0B5D5E] hover:bg-[#08494A] active:scale-[0.99] text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center space-x-2.5 shadow-sm transition-all min-h-[48px] cursor-pointer disabled:opacity-50"
        >
          <Ticket className="w-5 h-5 stroke-[2.2]" />
          <span className="text-base tracking-wide">
            {isSubmitting ? 'Confirming Token...' : 'Confirm & Take Token'}
          </span>
        </button>

      </form>

      {/* Info Card at bottom */}
      <div className="rounded-2xl bg-slate-50/90 border border-slate-100 p-4 flex items-start space-x-3 text-xs text-slate-600">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <ul className="space-y-1 text-slate-600 leading-relaxed">
          <li>&bull; You will receive a token number for today's queue.</li>
          <li>&bull; Please keep your phone nearby for updates.</li>
          <li>&bull; Waiting time is an estimate and may vary.</li>
        </ul>
      </div>

    </div>
  );
}

export default BookTokenPage;
