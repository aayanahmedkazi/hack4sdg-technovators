import React, { useState, useEffect } from 'react';
import { Calendar, Stethoscope, Play, RotateCcw, Sparkles } from 'lucide-react';
import { PatientQueueCard } from './PatientQueueCard';
import { BookTokenPage } from './BookTokenPage';

export function ClinicQueueSystem({
  initialTokenNumber = 10,
  initialNowServing = 3,
  initialDoctor = {
    name: 'Dr. Sameer Khan',
    speciality: 'Cardiology',
    room: 'Room 1',
    status: 'On Duty',
  },
  initialPatientName = 'Aarav Sharma',
  initialPhone = '+91 98765 43210',
  className = '',
}) {
  const [tokenNumber, setTokenNumber] = useState(initialTokenNumber);
  const [nowServing, setNowServing] = useState(initialNowServing);
  const [doctor, setDoctor] = useState(initialDoctor);
  const [lastUpdated, setLastUpdated] = useState('10:24 AM');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSimControls, setShowSimControls] = useState(false);

  // Update time helper
  const updateTimestamp = () => {
    const now = new Date();
    setLastUpdated(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      updateTimestamp();
      setIsRefreshing(false);
    }, 600);
  };

  const handleTokenBooked = ({ doctor: bookedDoctor }) => {
    if (bookedDoctor) {
      setDoctor(bookedDoctor);
    }
    // Increment or assign next token
    const nextToken = Math.max(tokenNumber + 1, nowServing + 1);
    setTokenNumber(nextToken);
    updateTimestamp();
  };

  // Simulation handlers
  const handleSimulateNextPatient = () => {
    setNowServing((prev) => {
      const next = prev + 1;
      updateTimestamp();
      return next;
    });
  };

  const handleResetSimulation = () => {
    setTokenNumber(10);
    setNowServing(3);
    setDoctor(initialDoctor);
    setLastUpdated('10:24 AM');
  };

  return (
    <div className={`space-y-6 ${className}`}>
      
      {/* ==============================================================
          HEADER BANNER: Soft gradient backdrop, Clinic Queue title,
          and Dr. Sameer Khan On-Duty card on the top right
         ============================================================== */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#DDF2F3]/70 via-[#EAF6F7]/60 to-[#F2F9FA]/80 border border-teal-100/60 p-6 sm:p-8">
        
        {/* Subtle decorative background vector elements */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-30 pointer-events-none hidden md:block">
          <svg viewBox="0 0 300 160" fill="none" className="w-full h-full object-cover">
            {/* Background chairs */}
            <rect x="180" y="70" width="35" height="35" rx="6" fill="#0B5D5E" opacity="0.3" />
            <rect x="225" y="70" width="35" height="35" rx="6" fill="#0B5D5E" opacity="0.3" />
            <rect x="270" y="70" width="35" height="35" rx="6" fill="#0B5D5E" opacity="0.3" />
            {/* Plant */}
            <path d="M140 120 Q145 60 155 40 Q155 80 145 120" fill="#2E7D5A" opacity="0.5" />
            <path d="M140 120 Q130 70 120 50 Q132 80 140 120" fill="#3D9970" opacity="0.4" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Left: Title & Subtitle */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Clinic Queue
            </h1>
            <p className="mt-1.5 text-sm sm:text-base text-slate-600 font-normal">
              See your token status and know when the doctor is ready for you.
            </p>
          </div>

          {/* Right: Doctor On Duty Card */}
          <div className="shrink-0">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-slate-200/80 shadow-sm p-3.5 px-4 sm:px-5 flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-mediteal shrink-0">
                <Calendar className="w-5 h-5 stroke-[2]" />
              </div>
              <div className="pr-2">
                <div className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                  {doctor.name}
                </div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">
                  {doctor.speciality} &bull; {doctor.room}
                </div>
              </div>
              <div className="shrink-0 pl-1">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {doctor.status}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ==============================================================
          MAIN TWO-COLUMN GRID:
          Left: Your Queue Status Card
          Right: Book a Clinic Token Card
         ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (Approx 58% width: 7 columns on large screens) */}
        <div className="lg:col-span-7">
          <PatientQueueCard
            tokenNumber={tokenNumber}
            nowServing={nowServing}
            doctorName={doctor.name}
            roomNumber={doctor.room}
            lastUpdatedTime={lastUpdated}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />
        </div>

        {/* Right Column (Approx 42% width: 5 columns on large screens) */}
        <div className="lg:col-span-5">
          <BookTokenPage
            defaultDoctorId="doc-001"
            defaultPatientName={initialPatientName}
            defaultPhone={initialPhone}
            onTokenBooked={handleTokenBooked}
          />
        </div>

      </div>

      {/* ==============================================================
          INTERACTIVE DEMO BAR (Allows testing the live queue simulation)
         ============================================================== */}
      <div className="pt-2">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-mediteal" />
            <span className="font-semibold text-slate-800">Queue Simulator:</span>
            <span>Test live status changes as the doctor calls patients into {doctor.room}.</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleSimulateNextPatient}
              className="px-3 py-1.5 rounded-lg bg-mediteal text-white font-medium hover:bg-mediteal-hover transition-colors flex items-center space-x-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Next Patient (Serving #{nowServing + 1})</span>
            </button>

            <button
              type="button"
              onClick={handleResetSimulation}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-100 transition-colors flex items-center space-x-1"
              title="Reset to default screenshot values"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

export default ClinicQueueSystem;
