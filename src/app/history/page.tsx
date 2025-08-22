
"use client";

import { useState, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { TimeEntry, AppSettings } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { isSameDay } from 'date-fns';

import AppLayout from '@/components/timeflow/app-layout';
import AppHeader from '@/components/timeflow/header';
import HistoryCard from '@/components/timeflow/history-card';


export default function HistoryPage() {
    const [settings, setSettings] = useLocalStorage<AppSettings>('timeflow-settings', {
        dailyWorkHourLimit: 8,
    });
    const [allEntries, setAllEntries] = useLocalStorage<TimeEntry[]>('timeflow-entries', []);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    const currentEntry = useMemo(() => {
        return allEntries.find(entry => entry.clockOut === null);
    }, [allEntries]);
    
    const isClockedIn = !!currentEntry;

    const entriesForSelectedDate = useMemo(() => {
        return allEntries.filter(entry => isSameDay(new Date(entry.clockIn), selectedDate))
                         .sort((a, b) => new Date(a.clockIn).getTime() - new Date(b.clockIn).getTime());
    }, [allEntries, selectedDate]);


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
    
    const handleResetData = () => {
        setAllEntries([]);
        setSettings({ dailyWorkHourLimit: 8 });
    };


    return (
        <AppLayout>
             <div className="flex flex-col h-full">
                <AppHeader 
                    onSaveSettings={setSettings} 
                    settings={settings} 
                    onSaveManualEntry={handleSaveManualEntry} 
                    isClockedIn={isClockedIn} 
                    onResetData={handleResetData}
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
                />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                    <HistoryCard 
                        entries={entriesForSelectedDate} 
                        onDelete={handleDeleteEntry}
                        onUpdate={handleUpdateEntry}
                    />
                </main>
            </div>
        </AppLayout>
    );
}
