
"use client";

import { useState, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { TimeEntry, AppSettings } from '@/types';
import { v4 as uuidv4 } from 'uuid';

import AppLayout from '@/components/timeflow/app-layout';
import AppHeader from '@/components/timeflow/header';
import DailySummary from '@/components/timeflow/daily-summary';


export default function SummaryPage() {
    const [settings, setSettings] = useLocalStorage<AppSettings>('timeflow-settings', {
        dailyWorkHourLimit: 8,
    });
    const [allEntries, setAllEntries] = useLocalStorage<TimeEntry[]>('timeflow-entries', []);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    const currentEntry = useMemo(() => {
        return allEntries.find(entry => entry.clockOut === null);
    }, [allEntries]);
    
    const isClockedIn = !!currentEntry;

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
                clockOut: null,
            };
            setAllEntries(prev => [...prev, newEntry]);
        }
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
                    <DailySummary 
                        entries={allEntries} 
                        selectedDate={selectedDate}
                    />
                </main>
            </div>
        </AppLayout>
    );
}
