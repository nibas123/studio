
"use client";

import type { AppSettings } from '@/types';
import { Button } from '@/components/ui/button';
import { Settings, PlusCircle, Trash2, CalendarIcon } from 'lucide-react';
import SettingsDialog from './settings-dialog';
import ManualEntryDialog from './manual-entry-dialog';
import { useSidebar } from '@/components/ui/sidebar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from './theme-toggle';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { formatDate } from '@/lib/time';


interface AppHeaderProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onSaveManualEntry: (entry: { clockIn?: string; clockOut?: string }) => void;
  isClockedIn: boolean;
  onResetData: () => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  showDatePicker?: boolean;
}

export default function AppHeader({ settings, onSaveSettings, onSaveManualEntry, isClockedIn, onResetData, selectedDate, onDateChange, showDatePicker = true }: AppHeaderProps) {
  const { isMobile } = useSidebar();
  
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-2">
        {isMobile && <SidebarTrigger />}
        {showDatePicker && (
            <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formatDate(selectedDate)}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && onDateChange(date)}
                initialFocus
                />
            </PopoverContent>
            </Popover>
        )}
      </div>
      <div className="flex items-center gap-2">
        <ManualEntryDialog onSave={onSaveManualEntry} isClockedIn={isClockedIn}>
          <Button variant="outline" size="sm">
            <PlusCircle className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Manual Entry</span>
          </Button>
        </ManualEntryDialog>
        <SettingsDialog settings={settings} onSave={onSaveSettings}>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Button>
        </SettingsDialog>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                <Trash2 className="h-5 w-5" />
                <span className="sr-only">Reset Data</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete all
                your time tracking data and reset your settings.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onResetData}>
                    Continue
                </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <ThemeToggle />
      </div>
    </header>
  );
}
