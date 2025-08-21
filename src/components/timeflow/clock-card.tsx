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
    <Card className="w-full shadow-lg border-none bg-card/50">
      <CardHeader>
        <CardTitle className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xl sm:text-2xl">Status</span>
          <div className="flex items-center gap-2 text-lg font-mono tracking-wider bg-background/70 px-4 py-2 rounded-lg">
            <Clock className="h-5 w-5 text-primary" />
            <span>{formatTime(currentTime)}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-8 pt-6">
        <div className="text-center">
            {isClockedIn && clockInTime ? (
                <>
                    <p className="text-muted-foreground">Clocked in at</p>
                    <p className="text-3xl font-semibold">{formatTime(clockInTime)}</p>
                </>
            ) : (
                 <>
                    <p className="text-muted-foreground">You are currently</p>
                    <p className="text-3xl font-semibold">Clocked Out</p>
                </>
            )}
        </div>

        <Button
          size="lg"
          className="w-56 h-16 text-xl rounded-full shadow-lg transition-transform transform hover:scale-105"
          onClick={isClockedIn ? onClockOut : onClockIn}
          variant={isClockedIn ? 'destructive' : 'default'}
        >
          {isClockedIn ? (
            <>
              <LogOut className="mr-3 h-7 w-7" /> Clock Out
            </>
          ) : (
            <>
              <LogIn className="mr-3 h-7 w-7" /> Clock In
            </>
          )}
        </Button>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full text-center pt-6 max-w-2xl mx-auto">
          <div className="bg-background/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground uppercase tracking-wider">Time Left</p>
            <p className={`text-2xl sm:text-3xl font-bold font-mono ${remainingTimeMs < 0 ? 'text-muted-foreground' : 'text-primary'}`}>
              {formatDuration(remainingTimeMs)}
            </p>
          </div>
          <div className="bg-background/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground uppercase tracking-wider">Time Worked</p>
            <p className="text-2xl sm:text-3xl font-bold font-mono">{formatDuration(totalWorkTodayMs)}</p>
          </div>
          <div className="bg-background/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground uppercase tracking-wider">Overtime</p>
            <p className={`text-2xl sm:text-3xl font-bold font-mono ${overtimeMs > 0 ? 'text-destructive' : ''}`}>
              {formatDuration(overtimeMs)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
