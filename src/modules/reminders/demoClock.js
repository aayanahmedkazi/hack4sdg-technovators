import { useState, useEffect } from 'react';

/**
 * Shared Virtual Demo Clock for MediFlow.
 * 
 * Allows moving the clock forward or jumping to exact test times
 * (e.g. 15 minutes before a dose, at dose time, or 30+ minutes past dose time).
 * All reminder components (ReminderAlarm, TodayReminders, DemoClockControl)
 * stay synchronized to this virtual clock.
 */

const STORAGE_KEY = 'mediflow_clock_offset_ms';
const CLOCK_EVENT_NAME = 'mediflow_virtual_clock_tick';

// Read initial offset from localStorage
function getInitialOffset() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      const parsed = Number(saved);
      if (!isNaN(parsed)) return parsed;
    }
  } catch (e) {}
  return 0;
}

let currentOffsetMs = getInitialOffset();

function notifyClockChange() {
  try {
    window.dispatchEvent(new CustomEvent(CLOCK_EVENT_NAME, { detail: { offsetMs: currentOffsetMs } }));
  } catch (e) {}
}

/**
 * Returns current virtual Date object.
 */
export function getVirtualTime() {
  return new Date(Date.now() + currentOffsetMs);
}

/**
 * Sets virtual time to a specific target.
 * Accepts:
 * - A time string like "07:45", "08:00", "20:00" (applied to today's date)
 * - A Date object or full ISO date string
 */
export function setVirtualTime(target) {
  let targetTimestamp;

  if (typeof target === 'string' && target.includes(':') && !target.includes('-')) {
    // Format is "HH:MM" e.g. "08:00"
    const [hours, minutes] = target.split(':').map(Number);
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
    targetTimestamp = d.getTime();
  } else if (target instanceof Date) {
    targetTimestamp = target.getTime();
  } else if (typeof target === 'string') {
    targetTimestamp = new Date(target).getTime();
  } else if (typeof target === 'number') {
    targetTimestamp = target;
  } else {
    return;
  }

  currentOffsetMs = targetTimestamp - Date.now();
  try {
    localStorage.setItem(STORAGE_KEY, String(currentOffsetMs));
  } catch (e) {}
  notifyClockChange();
}

/**
 * Adds or subtracts minutes to the virtual clock.
 */
export function addVirtualMinutes(minutes) {
  currentOffsetMs += minutes * 60 * 1000;
  try {
    localStorage.setItem(STORAGE_KEY, String(currentOffsetMs));
  } catch (e) {}
  notifyClockChange();
}

/**
 * Resets virtual clock back to real system time.
 */
export function resetVirtualTime() {
  currentOffsetMs = 0;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {}
  notifyClockChange();
}

/**
 * Formats a Date object as 12-hour or 24-hour time string.
 */
export function formatTime(date) {
  if (!date) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * React hook to subscribe to the virtual demo clock.
 * Ticks every second and re-renders whenever virtual time changes.
 */
export function useDemoClock() {
  const [virtualTime, setClockTime] = useState(getVirtualTime());

  useEffect(() => {
    // Update local state when tick event or manual jump happens
    const handleEvent = () => {
      setClockTime(getVirtualTime());
    };

    window.addEventListener(CLOCK_EVENT_NAME, handleEvent);

    // Also tick every second so clock moves forward naturally
    const timer = setInterval(() => {
      setClockTime(getVirtualTime());
    }, 1000);

    return () => {
      window.removeEventListener(CLOCK_EVENT_NAME, handleEvent);
      clearInterval(timer);
    };
  }, []);

  const isCustomTime = Math.abs(currentOffsetMs) > 2000;

  const jumpToTime = (timeStr) => setVirtualTime(timeStr);

  return {
    virtualTime,
    formattedTime: formatTime(virtualTime),
    time24: `${String(virtualTime.getHours()).padStart(2, '0')}:${String(virtualTime.getMinutes()).padStart(2, '0')}`,
    dateString: virtualTime.toISOString().slice(0, 10),
    isCustomTime,
    offsetMs: currentOffsetMs,
    setVirtualTime,
    addVirtualMinutes,
    resetVirtualTime,
    jumpToTime,
  };
}
