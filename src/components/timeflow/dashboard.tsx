"use client";

import { useState, useEffect, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { TimeEntry, AppSettings } from '@/types';
import { calculateTodaysWork } from '@/lib/time';
import { isToday } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

import AppHeader from './header';
import ClockCard from './clock-card';
import HistoryCard from './history-card';
import AiAlert from './ai-alert';

export default function Dashboard() {
  const [settings, setSettings] = useLocalStorage<AppSettings>('timeflow-settings', {
    dailyWorkHourLimit: 8,
  });
  const [allEntries, setAllEntries] = useLocalStorage<TimeEntry[]>('timeflow-entries', []);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const todaysEntries = useMemo(() => {
    return allEntries.filter(entry => isToday(new Date(entry.clockIn))).sort((a, b) => new Date(b.clockIn).getTime() - new Date(a.clockIn).getTime());
  }, [allEntries]);

  const currentEntry = useMemo(() => {
    return allEntries.find(entry => entry.clockOut === null);
  }, [allEntries]);

  const isClockedIn = !!currentEntry;

  const totalWorkTodayMs = useMemo(() => {
    return calculateTodaysWork(allEntries, currentTime);
  }, [allEntries, currentTime]);

  const handleClockIn = () => {
    if (isClockedIn) return;
    const newEntry: TimeEntry = {
      id: uuidv4(),
      clockIn: new Date().toISOString(),
      clockOut: null,
    };
    setAllEntries(prev => [...prev, newEntry]);
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
     } else if (!isClockedIn && entry.clockIn && entry.clockOut) {
        const newEntry: TimeEntry = {
            id: uuidv4(),
            clockIn: new Date(entry.clockIn).toISOString(),
            clockOut: new Date(entry.clockOut).toISOString(),
        };
        setAllEntries(prev => [...prev, newEntry]);
     }
  };

  const handleDeleteEntry = (id: string) => {
    setAllEntries(prev => prev.filter(entry => entry.id !== id));
  };
  
  const handleUpdateEntry = (updatedEntry: TimeEntry) => {
    setAllEntries(prev => prev.map(entry => entry.id === updatedEntry.id ? updatedEntry : entry));
  };


  return (
    <div className="space-y-6">
      <AppHeader onSaveSettings={setSettings} settings={settings} onSaveManualEntry={handleSaveManualEntry} isClockedIn={isClockedIn} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <ClockCard
            currentTime={currentTime}
            isClockedIn={isClockedIn}
            onClockIn={handleClockIn}
            onClockOut={handleClockOut}
            totalWorkTodayMs={totalWorkTodayMs}
            dailyLimitHours={settings.dailyWorkHourLimit}
            clockInTime={currentEntry?.clockIn}
          />
        </div>
        <div className="lg:col-span-3">
          <HistoryCard entries={todaysEntries} onDelete={handleDeleteEntry} onUpdate={handleUpdateEntry} />
        </div>
      </div>
      {isClockedIn && <AiAlert allEntries={allEntries} settings={settings} />}
    </div>
  );
}
