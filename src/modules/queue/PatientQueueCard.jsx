import React, { useState } from 'react';
import { Ticket, User, Users, Clock, RotateCw, Check } from 'lucide-react';
import { ClinicLoungeIllustration } from './ClinicLoungeIllustration';

export function PatientQueueCard({
  tokenNumber = 10,
  nowServing = 3,
  doctorName = 'Dr. Sameer Khan',
  roomNumber = 'Room 1',
  lastUpdatedTime = '10:24 AM',
  onRefresh,
  isRefreshing = false,
  className = '',
}) {
  const [internalRefreshing, setInternalRefreshing] = useState(false);

  const handleRefreshClick = () => {
    setInternalRefreshing(true);
    if (onRefresh) onRefresh();
    setTimeout(() => setInternalRefreshing(false), 600);
  };

  const refreshing = isRefreshing || internalRefreshing;

  // Calculate dynamic people ahead and wait times
  const peopleAhead = Math.max(0, tokenNumber - nowServing);
  const minWait = peopleAhead * 10;
  const maxWait = Math.round(peopleAhead * 12);
  const waitDisplay = peopleAhead === 0 ? 'Now!' : `~${minWait}–${maxWait} mins`;

  // Determine current step (1: Booked, 2: In Queue, 3: In Room)
  let currentStep = 2;
  if (nowServing >= tokenNumber) {
    currentStep = 3;
  } else if (!tokenNumber) {
    currentStep = 1;
  }

  // Format token numbers with leading zeros (e.g., #10, #03)
  const formatToken = (num) => {
    if (num === null || num === undefined) return '--';
    return `#${num < 10 ? '0' + num : num}`;
  };

  return (
    <div className={`bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 flex flex-col justify-between space-y-6 ${className}`}>
      
      {/* Top Header: Title, Live indicator, and Last updated with Refresh */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Your Queue Status
          </h2>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Updates
          </span>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium">
          <span>Last updated: {lastUpdatedTime}</span>
          <button
            type="button"
            onClick={handleRefreshClick}
            className="p-1 rounded-lg text-slate-400 hover:text-mediteal hover:bg-slate-100 transition-colors"
            title="Refresh Queue Status"
          >
            <RotateCw className={`w-3.5 h-3.5 transition-transform duration-500 ${refreshing ? 'animate-spin text-mediteal' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        
        {/* Card 1: Your Token */}
        <div className="rounded-2xl bg-[#F0FAF7] border border-teal-100/90 p-4 flex flex-col justify-between">
          <div className="w-8 h-8 rounded-lg bg-teal-100/60 flex items-center justify-center text-[#0B5D5E] mb-2">
            <Ticket className="w-4 h-4 stroke-[2.2]" />
          </div>
          <span className="text-xs font-medium text-slate-600">Your Token</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#0B5D5E] tracking-tight my-1">
            {formatToken(tokenNumber)}
          </div>
          <span className="text-xs font-semibold text-emerald-600">Confirmed</span>
        </div>

        {/* Card 2: Now Serving */}
        <div className="rounded-2xl bg-[#F0F7FF] border border-sky-100/90 p-4 flex flex-col justify-between">
          <div className="w-8 h-8 rounded-lg bg-sky-100/60 flex items-center justify-center text-[#0284C7] mb-2">
            <User className="w-4 h-4 stroke-[2.2]" />
          </div>
          <span className="text-xs font-medium text-slate-600">Now Serving</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#0284C7] tracking-tight my-1">
            {formatToken(nowServing)}
          </div>
          <span className="text-xs font-semibold text-slate-500">{roomNumber}</span>
        </div>

        {/* Card 3: People Ahead */}
        <div className="rounded-2xl bg-[#FFF9F2] border border-amber-100/90 p-4 flex flex-col justify-between">
          <div className="w-8 h-8 rounded-lg bg-amber-100/60 flex items-center justify-center text-[#D97706] mb-2">
            <Users className="w-4 h-4 stroke-[2.2]" />
          </div>
          <span className="text-xs font-medium text-slate-600">People Ahead</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#D97706] tracking-tight my-1">
            {peopleAhead}
          </div>
          <span className="text-xs font-semibold text-slate-500">Waiting ahead</span>
        </div>

        {/* Card 4: Estimated Wait */}
        <div className="rounded-2xl bg-[#FAF7FD] border border-purple-100/90 p-4 flex flex-col justify-between">
          <div className="w-8 h-8 rounded-lg bg-purple-100/60 flex items-center justify-center text-[#7C3AED] mb-2">
            <Clock className="w-4 h-4 stroke-[2.2]" />
          </div>
          <span className="text-xs font-medium text-slate-600">Estimated Wait</span>
          <div className="text-lg sm:text-xl font-extrabold text-[#7C3AED] tracking-tight my-1 whitespace-nowrap">
            {waitDisplay}
          </div>
          <span className="text-[11px] font-medium text-slate-500">Approx. 10 mins per patient</span>
        </div>

      </div>

      {/* Queue Progress Stepper */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900">Queue Progress</h3>
          <span className="text-xs font-semibold text-mediteal">Step {currentStep} of 3</span>
        </div>

        {/* Stepper bar */}
        <div className="relative pt-2 pb-6">
          {/* Background connecting track */}
          <div className="absolute top-5 left-6 right-6 h-1.5 bg-slate-200 rounded-full" />
          
          {/* Active progress fill */}
          <div
            className="absolute top-5 left-6 h-1.5 bg-[#0B5D5E] rounded-full transition-all duration-500"
            style={{
              width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%',
              maxWidth: 'calc(100% - 48px)',
            }}
          />

          {/* Stepper Nodes */}
          <div className="relative flex justify-between">
            {/* Step 1: Booked */}
            <div className="flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                  currentStep >= 1
                    ? 'bg-[#0B5D5E] text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {currentStep > 1 ? <Check className="w-3.5 h-3.5 stroke-[2.8]" /> : '1'}
              </div>
              <span className={`text-xs mt-2 font-semibold ${currentStep >= 1 ? 'text-slate-800' : 'text-slate-400'}`}>
                Booked
              </span>
            </div>

            {/* Step 2: In Queue */}
            <div className="flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                  currentStep >= 2
                    ? 'bg-[#0B5D5E] text-white ring-4 ring-teal-100'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {currentStep > 2 ? <Check className="w-3.5 h-3.5 stroke-[2.8]" /> : '2'}
              </div>
              <span className={`text-xs mt-2 font-bold ${currentStep === 2 ? 'text-mediteal' : currentStep > 2 ? 'text-slate-800' : 'text-slate-400'}`}>
                In Queue
              </span>
            </div>

            {/* Step 3: In Room */}
            <div className="flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                  currentStep >= 3
                    ? 'bg-[#0B5D5E] text-white ring-4 ring-teal-100 animate-pulse'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                3
              </div>
              <span className={`text-xs mt-2 font-semibold ${currentStep === 3 ? 'text-mediteal font-bold' : 'text-slate-400'}`}>
                In Room
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Waiting Lounge Alert Banner with Vector Illustration */}
      <div className="rounded-2xl bg-gradient-to-r from-[#F0F8FF] to-[#E8F4F8] border border-sky-100/90 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Left message with clock icon */}
        <div className="flex items-start space-x-3.5">
          <div className="w-8 h-8 rounded-full bg-mediteal-light/90 border border-mediteal/30 flex items-center justify-center text-mediteal shrink-0 mt-0.5">
            <Clock className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
              {currentStep === 3 ? (
                <span className="text-emerald-700">It's your turn! Please enter {roomNumber}.</span>
              ) : (
                'Please wait in the clinic lounge.'
              )}
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {currentStep === 3 ? (
                `${doctorName} is ready for consultation in ${roomNumber}.`
              ) : (
                <>
                  There are <strong className="text-slate-900 font-bold">{peopleAhead} patients</strong> ahead of you. We will notify you when your turn is near.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Right vector artwork matching the screenshot */}
        <ClinicLoungeIllustration className="w-44 sm:w-52 h-auto shrink-0 select-none pointer-events-none" />

      </div>

    </div>
  );
}

export default PatientQueueCard;
