"use client";

import { useState } from 'react';
import type { AppSettings } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SettingsDialogProps {
  children: React.ReactNode;
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

export default function SettingsDialog({ children, settings, onSave }: SettingsDialogProps) {
  const [dailyLimit, setDailyLimit] = useState(settings.dailyWorkHourLimit);

  const handleSave = () => {
    onSave({ dailyWorkHourLimit: Number(dailyLimit) });
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Adjust your TimeFlow settings here.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="daily-limit" className="text-right">
              Daily Limit
            </Label>
            <Input
              id="daily-limit"
              type="number"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(Number(e.target.value))}
              className="col-span-3"
              placeholder="e.g., 8"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="submit" onClick={handleSave}>Save changes</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
