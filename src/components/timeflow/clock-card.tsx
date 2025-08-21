"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, LogIn, LogOut } from 'lucide-react';
import { formatTime, formatDuration } from '@/lib/time';

interface ClockCardProps {
  currentTime: Date;
  isClockedIn: boolean;
  onClockIn: () => void;
  onClockOut: () => void;
  totalWorkTodayMs: number;
  dailyLimitHours: number;
  clockInTime?: string;
}

export default function ClockCard({
  currentTime,
  isClockedIn,
  onClockIn,
  onClockOut,
  totalWorkTodayMs,
  dailyLimitHours,
  clockInTime,
}: ClockCardProps) {
  const dailyLimitMs = dailyLimitHours * 60 * 60 * 1000;
  const remainingTimeMs = dailyLimitMs - totalWorkTodayMs;
  const overtimeMs = totalWorkTodayMs > dailyLimitMs ? totalWorkTodayMs - dailyLimitMs : 0;

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xl sm:text-2xl">Status</span>
          <div className="flex items-center gap-2 text-lg font-mono tracking-wider bg-primary/10 px-3 py-1 rounded-md">
            <Clock className="h-5 w-5 text-primary" />
            <span>{formatTime(currentTime)}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-6 pt-6">
        <div className="text-center">
            {isClockedIn && clockInTime ? (
                <>
                    <p className="text-muted-foreground">Clocked in at</p>
                    <p className="text-2xl font-semibold">{formatTime(clockInTime)}</p>
                </>
            ) : (
                 <>
                    <p className="text-muted-foreground">You are currently</p>
                    <p className="text-2xl font-semibold">Clocked Out</p>
                </>
            )}
        </div>

        <Button
          size="lg"
          className="w-48 h-14 text-lg rounded-full shadow-md transition-transform transform hover:scale-105"
          onClick={isClockedIn ? onClockOut : onClockIn}
        >
          {isClockedIn ? (
            <>
              <LogOut className="mr-2 h-6 w-6" /> Clock Out
            </>
          ) : (
            <>
              <LogIn className="mr-2 h-6 w-6" /> Clock In
            </>
          )}
        </Button>

        <div className="grid grid-cols-3 gap-2 w-full text-center pt-6">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Remaining</p>
            <p className={`text-xl sm:text-2xl font-bold font-mono ${remainingTimeMs < 0 ? 'text-muted-foreground' : 'text-primary'}`}>
              {formatDuration(remainingTimeMs)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Worked</p>
            <p className="text-xl sm:text-2xl font-bold font-mono">{formatDuration(totalWorkTodayMs)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Overtime</p>
            <p className={`text-xl sm:text-2xl font-bold font-mono ${overtimeMs > 0 ? 'text-destructive' : ''}`}>
              {formatDuration(overtimeMs)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
