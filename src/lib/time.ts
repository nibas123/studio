import { format, intervalToDuration, differenceInMilliseconds, isSameDay, startOfDay, endOfDay } from 'date-fns';
import type { TimeEntry, DailySummaryData, BreakEntry } from '@/types';

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
    .filter(entry => isSameDay(new Date(entry.clockIn), currentTime))
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
        .filter(entry => isSameDay(new Date(entry.clockIn), currentTime))
        .sort((a, b) => new Date(a.clockIn).getTime() - new Date(b.clockIn).getTime());
    
    if (todaysEntries.length <= 1) {
        // If there's one entry and it's completed, the break is from clock-out to now
        if (todaysEntries[0] && todaysEntries[0].clockOut) {
          const lastClockOut = new Date(todaysEntries[0].clockOut);
          // Only count break time if it's on the same day
          return isSameDay(lastClockOut, currentTime) ? differenceInMilliseconds(currentTime, lastClockOut) : 0;
        }
        return 0; // No breaks if only one entry and still clocked in, or no entries
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
        const lastClockOut = new Date(lastEntry.clockOut!);
        if (isSameDay(lastClockOut, currentTime)) {
           totalBreak += differenceInMilliseconds(currentTime, lastClockOut);
        }
    }

    return totalBreak;
}

export const calculateEntryDuration = (entry: Partial<TimeEntry>): number => {
    if (!entry.clockIn || !entry.clockOut) return 0;
    const start = new Date(entry.clockIn);
    const end = new Date(entry.clockOut);
    return differenceInMilliseconds(end, start);
};


export const calculateDailySummary = (allEntries: TimeEntry[], date: Date): DailySummaryData => {
  const entriesForDay = allEntries
    .filter(entry => isSameDay(new Date(entry.clockIn), date))
    .sort((a, b) => new Date(a.clockIn).getTime() - new Date(b.clockIn).getTime());

  if (entriesForDay.length === 0) {
    return {
      totalWork: 0,
      totalBreak: 0,
      firstClockIn: null,
      lastClockOut: null,
      breaks: [],
      workPercentage: 0,
      breakPercentage: 0,
      entries: [],
    };
  }

  let totalWork = 0;
  const breaks: BreakEntry[] = [];

  entriesForDay.forEach((entry, index) => {
    if (entry.clockOut) {
      totalWork += differenceInMilliseconds(new Date(entry.clockOut), new Date(entry.clockIn));
      
      // Calculate break after this entry
      const nextEntry = entriesForDay[index + 1];
      if (nextEntry) {
        const breakStart = new Date(entry.clockOut);
        const breakEnd = new Date(nextEntry.clockIn);
        const duration = differenceInMilliseconds(breakEnd, breakStart);
        if (duration > 0) {
          breaks.push({
            start: breakStart.toISOString(),
            end: breakEnd.toISOString(),
            duration: duration,
          });
        }
      }
    } else {
      // If still clocked in, count work until now (if it's today)
      if (isSameDay(date, new Date())) {
        totalWork += differenceInMilliseconds(new Date(), new Date(entry.clockIn));
      }
    }
  });

  const totalBreak = breaks.reduce((sum, b) => sum + b.duration, 0);
  const totalTime = totalWork + totalBreak;
  
  const firstClockIn = entriesForDay[0].clockIn;
  const lastCompletedEntry = [...entriesForDay].reverse().find(e => e.clockOut);
  const lastClockOut = lastCompletedEntry ? lastCompletedEntry.clockOut : null;
  
  return {
    totalWork,
    totalBreak,
    firstClockIn,
    lastClockOut,
    breaks,
    workPercentage: totalTime > 0 ? Math.round((totalWork / totalTime) * 100) : 0,
    breakPercentage: totalTime > 0 ? Math.round((totalBreak / totalTime) * 100) : 0,
    entries: entriesForDay,
  };
};
