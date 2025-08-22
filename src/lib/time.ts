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
    entries: TimeEntry[],
    currentTime: Date
): number => {
    const todaysEntries = entries
        .filter(entry => isToday(new Date(entry.clockIn)))
        .sort((a, b) => new Date(a.clockIn).getTime() - new Date(b.clockIn).getTime());

    if (todaysEntries.length <= 1) {
        const isClockedIn = todaysEntries[0] ? todaysEntries[0].clockOut === null : false;
        if (isClockedIn || todaysEntries.length === 0) {
            return 0; // No breaks if only one entry and clocked in, or no entries
        }
        // If there's one entry and it's completed, the break is from clock-out to now
        return differenceInMilliseconds(currentTime, new Date(todaysEntries[0].clockOut!));
    }
    
    let totalBreak = 0;
    // Calculate breaks between completed entries
    for (let i = 0; i < todaysEntries.length - 1; i++) {
        const currentEntry = todaysEntries[i];
        const nextEntry = todaysEntries[i+1];
        if (currentEntry.clockOut) {
            totalBreak += differenceInMilliseconds(new Date(nextEntry.clockIn), new Date(currentEntry.clockOut));
        }
    }

    const lastEntry = todaysEntries[todaysEntries.length - 1];
    const isClockedIn = lastEntry.clockOut === null;

    // If currently clocked out, add the time since the last clock out
    if (!isClockedIn) {
        totalBreak += differenceInMilliseconds(currentTime, new Date(lastEntry.clockOut!));
    }

    return totalBreak;
}

export const calculateEntryDuration = (entry: { clockIn: string; clockOut: string | null }): number => {
  if (!entry.clockOut) return 0;
  const start = new Date(entry.clockIn);
  const end = new Date(entry.clockOut);
  return differenceInMilliseconds(end, start);
}
