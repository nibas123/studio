"use client";

import { useState, useEffect } from 'react';
import type { TimeEntry, AppSettings } from '@/types';
import { aiClockOutAlert } from '@/ai/flows/clock-out-alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

interface AiAlertProps {
  allEntries: TimeEntry[];
  settings: AppSettings;
  onClockOut: () => void;
}

// Check every 10 minutes
const CHECK_INTERVAL = 1000 * 60 * 10;

export default function AiAlert({ allEntries, settings, onClockOut }: AiAlertProps) {
  const [showAlert, setShowAlert] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const check = async () => {
      const currentEntry = allEntries.find(entry => entry.clockOut === null);
      if (!currentEntry) return;

      const timeWorked = new Date().getTime() - new Date(currentEntry.clockIn).getTime();
      const limitMs = settings.dailyWorkHourLimit * 60 * 60 * 1000;

      // Only check if user has worked past their limit + 15 mins
      if (timeWorked > limitMs + (1000 * 60 * 15)) {
        try {
          const historicalData = JSON.stringify(
            allEntries.filter(e => e.id !== currentEntry.id && e.clockOut)
          );
          
          const result = await aiClockOutAlert({
            historicalData,
            currentTime: new Date().toISOString(),
            dailyWorkHourLimit: settings.dailyWorkHourLimit,
          });

          if (result.forgotToClockOut) {
            setShowAlert(true);
          }
        } catch (error) {
          console.error("AI Clock Out Alert Error:", error);
          toast({
            variant: "destructive",
            title: "AI Alert Error",
            description: "Could not check if you forgot to clock out.",
          });
        }
      }
    };

    const intervalId = setInterval(check, CHECK_INTERVAL);

    // Initial check on component mount
    check();

    return () => clearInterval(intervalId);
  }, [allEntries, settings, toast]);

  const handleClockOut = () => {
    onClockOut();
    setShowAlert(false);
  }

  return (
    <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Did you forget to clock out?</AlertDialogTitle>
          <AlertDialogDescription>
            Our AI assistant noticed you've been clocked in for a while.
            Would you like to clock out now?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>No, I'm still working</AlertDialogCancel>
          <AlertDialogAction onClick={handleClockOut}>Clock Out Now</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
