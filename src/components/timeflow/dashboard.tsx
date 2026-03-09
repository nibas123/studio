
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { TimeEntry, AppSettings } from '@/types';
import { calculateTodaysWork, calculateTodaysBreak } from '@/lib/time';
import { v4 as uuidv4 } from 'uuid';
import { startOfMonth, endOfMonth, isWithinInterval, isSameDay } from 'date-fns';
import { track } from '@vercel/analytics';

import AppHeader from './header';
import ClockCard from './clock-card';
import EndDayDialog from './end-day-dialog';

export default function Dashboard() {
  const [settings, setSettings] = useLocalStorage<AppSettings>('timeflow-settings', {
    dailyWorkHourLimit: 8,
    monthlyWfhLimit: 5,
  });
  const [allEntries, setAllEntries] = useLocalStorage<TimeEntry[]>('timeflow-entries', []);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showEndDayDialog, setShowEndDayDialog] = useState(false);
  const [mounted, setMounted] = useState(false);

  const currentEntry = useMemo(() => {
    return allEntries.find(entry => entry.clockOut === null);
  }, [allEntries]);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-Clock Out Protection
  useEffect(() => {
    if (currentEntry && mounted) {
      const clockInTime = new Date(currentEntry.clockIn).getTime();
      const now = currentTime.getTime();
      const hoursClockedIn = (now - clockInTime) / (1000 * 60 * 60);
      
      // If clocked in for more than 14 hours, assume they forgot and auto-clock out 
      // at their daily limit to preserve their time calculations.
      if (hoursClockedIn >= 14) {
         const autoClockOutTime = new Date(clockInTime + (settings.dailyWorkHourLimit * 60 * 60 * 1000)).toISOString();
         setAllEntries(prev => prev.map(entry => entry.id === currentEntry.id ? { ...entry, clockOut: autoClockOutTime } : entry));
      }
    }
  }, [currentEntry, currentTime, mounted, settings.dailyWorkHourLimit, setAllEntries]);


  const isClockedIn = !!currentEntry;

  const totalWorkTodayMs = useMemo(() => {
    return calculateTodaysWork(allEntries, currentTime);
  }, [allEntries, currentTime]);
  
  const totalBreakTodayMs = useMemo(() => {
    return calculateTodaysBreak(allEntries, currentTime);
  }, [allEntries, currentTime]);

  const wfhDaysUsedThisMonth = useMemo(() => {
    const start = startOfMonth(currentTime);
    const end = endOfMonth(currentTime);
    const wfhEntries = allEntries.filter(e => e.wfhType && isWithinInterval(new Date(e.clockIn), { start, end }));
    
    let total = 0;
    const daysSeen = new Set<string>();
    wfhEntries.forEach(e => {
       const day = e.clockIn.split('T')[0];
       if (!daysSeen.has(day)) {
           daysSeen.add(day);
           total += e.wfhType === 'half' ? 0.5 : 1;
       }
    });
    return total;
  }, [allEntries, currentTime]);

  const todaysWfh = useMemo(() => {
    return allEntries.find(e => e.wfhType && isSameDay(new Date(e.clockIn), currentTime));
  }, [allEntries, currentTime]);

  const handleClockIn = () => {
    if (isClockedIn) return;
    const newEntry: TimeEntry = {
      id: uuidv4(),
      clockIn: new Date().toISOString(),
      clockOut: null,
    };
    setAllEntries(prev => [...prev, newEntry]);
    track('Clock In Clicked');
  };

  const handleLogWfh = (type: 'full' | 'half') => {
    const now = new Date();
    setAllEntries(prev => {
        const filtered = prev.filter(e => !(e.wfhType && isSameDay(new Date(e.clockIn), now)));
        return [...filtered, {
            id: uuidv4(),
            clockIn: now.toISOString(),
            clockOut: now.toISOString(),
            wfhType: type,
        }];
    });
    track('Log WFH Clicked', { type });
  };

  const handleUndoWfh = () => {
     const now = new Date();
     setAllEntries(prev => prev.filter(e => !(e.wfhType && isSameDay(new Date(e.clockIn), now))));
  };

  const handleClockOut = () => {
    if (!currentEntry) return;
    setAllEntries(prev =>
      prev.map(entry =>
        entry.id === currentEntry.id
          ? { ...entry, clockOut: new Date().toISOString() }
          : entry
      )
    );
    track('Clock Out Clicked');
  };

  const handleEndDay = () => {
    if (!currentEntry) return;
    
    // Perform the final clock out
    setAllEntries(prev =>
      prev.map(entry =>
        entry.id === currentEntry.id
          ? { ...entry, clockOut: new Date().toISOString() }
          : entry
      )
    );

    // Show the summary/download dialog
    setShowEndDayDialog(true);
    track('End Day Clicked');
  };
  
  const handleSaveManualEntry = (entry: { clockIn?: string; clockOut?: string }) => {
     if (isClockedIn && entry.clockOut && currentEntry) {
        setAllEntries(prev =>
          prev.map(e =>
            e.id === currentEntry.id
              ? { ...e, clockOut: new Date(entry.clockOut!).toISOString() }
              : e
          )
        );
     } else if (!isClockedIn && entry.clockIn) {
        const newEntry: TimeEntry = {
            id: uuidv4(),
            clockIn: new Date(entry.clockIn).toISOString(),
            clockOut: entry.clockOut ? new Date(entry.clockOut).toISOString() : null,
        };
        setAllEntries(prev => [...prev, newEntry]);
     }
     track('Manual Entry Saved', { isClockedIn });
  };

  const handleResetData = () => {
    setAllEntries([]);
    setSettings({ dailyWorkHourLimit: 8 });
  };


  if (!mounted) return null;

  return (
    <div className="flex flex-col h-full">
      <AppHeader 
        onSaveSettings={setSettings} 
        settings={settings} 
        onSaveManualEntry={handleSaveManualEntry} 
        isClockedIn={isClockedIn} 
        onResetData={handleResetData}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        showDatePicker={false}
      />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          <ClockCard
              currentTime={currentTime}
              isClockedIn={isClockedIn}
              onClockIn={handleClockIn}
              onClockOut={handleClockOut}
              onEndDay={handleEndDay}
              totalWorkTodayMs={totalWorkTodayMs}
              totalBreakTodayMs={totalBreakTodayMs}
              dailyLimitHours={settings.dailyWorkHourLimit}
              clockInTime={currentEntry?.clockIn}
              wfhDaysUsed={wfhDaysUsedThisMonth}
              monthlyWfhLimit={settings.monthlyWfhLimit ?? 5}
              todaysWfhType={todaysWfh?.wfhType}
              onLogWfh={handleLogWfh}
              onUndoWfh={handleUndoWfh}
          />
        {showEndDayDialog && (
          <EndDayDialog
            isOpen={showEndDayDialog}
            onClose={() => setShowEndDayDialog(false)}
            entries={allEntries}
            selectedDate={new Date()}
          />
        )}
      </main>
    </div>
  );
}
