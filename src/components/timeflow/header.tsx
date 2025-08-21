"use client";

import type { AppSettings } from '@/types';
import { Button } from '@/components/ui/button';
import { Settings, PlusCircle } from 'lucide-react';
import SettingsDialog from './settings-dialog';
import ManualEntryDialog from './manual-entry-dialog';

interface AppHeaderProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onSaveManualEntry: (entry: { clockIn: string; clockOut: string }) => void;
}

export default function AppHeader({ settings, onSaveSettings, onSaveManualEntry }: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between pb-4 border-b">
      <h1 className="text-3xl font-bold text-primary-foreground/90">
        TimeFlow
      </h1>
      <div className="flex items-center gap-2">
        <ManualEntryDialog onSave={onSaveManualEntry}>
          <Button variant="outline" size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Manual Entry
          </Button>
        </ManualEntryDialog>
        <SettingsDialog settings={settings} onSave={onSaveSettings}>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Button>
        </SettingsDialog>
      </div>
    </header>
  );
}
