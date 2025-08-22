import { format, formatDuration as formatDurationFns, intervalToDuration, differenceInMilliseconds, isToday } from 'date-fns';
import type { TimeEntry } from '@/types';

export const formatTime = (date: Date | string): string => {
  const dt = typeof date === 'string' ? new Date(date) : date;
  return format(dt, 'hh:mm:ss a');
};

export const formatDate = (date: Date | string): string => {
  const dt = typeof date === 'string' ? new Date(date) : date;
  return format(dt, 'MMMM d, yyyy');
};

export const formatDateTime = (date: Date | string): string => {
  const dt = typeof date === 'string' ? new Date(date) : date;
  return format(dt, 'PP, h:mm a');
};

export const formatDuration = (milliseconds: number): string => {
  if (isNaN(milliseconds) || milliseconds < 0) milliseconds = 0;
  const duration = intervalToDuration({ start: 0, end: milliseconds });
  
  const hours = String(duration.hours || 0).padStart(2, '0');
  const minutes = String(duration.minutes || 0).padStart(2, '0');
  const seconds = String(duration.seconds || 0).padStart(2, '0');
  
  return `${hours}:${minutes}:${seconds}`;
};

export const calculateTodaysWork = (
  entries: TimeEntry[],
  currentTime: Date
): number => {
  return entries
    .filter(entry => isToday(new Date(entry.clockIn)))
    .reduce((total, entry) => {
      const start = new Date(entry.clockIn);
      const end = entry.clockOut ? new Date(entry.clockOut) : currentTime;
      return total + differenceInMilliseconds(end, start);
    }, 0);
};

export const calculateTodaysBreak = (
    entries: TimeEntry[]
): number => {
    const todaysCompletedEntries = entries
        .filter(entry => entry.clockOut && isToday(new Date(entry.clockIn)))
        .sort((a, b) => new Date(a.clockIn).getTime() - new Date(b.clockIn).getTime());

    if (todaysCompletedEntries.length < 2) {
        return 0;
    }

    let breakTime = 0;
    for (let i = 0; i < todaysCompletedEntries.length - 1; i++) {
        const currentClockOut = new Date(todaysCompletedEntries[i].clockOut!);
        const nextClockIn = new Date(todaysCompletedEntries[i+1].clockIn);
        breakTime += differenceInMilliseconds(nextClockIn, currentClockOut);
    }

    return breakTime;
}

export const calculateEntryDuration = (entry: { clockIn: string; clockOut: string | null }): number => {
  if (!entry.clockOut) return 0;
  const start = new Date(entry.clockIn);
  const end = new Date(entry.clockOut);
  return differenceInMilliseconds(end, start);
}
