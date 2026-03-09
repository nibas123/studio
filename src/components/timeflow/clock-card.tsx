"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, LogIn, LogOut, DoorOpen } from 'lucide-react';
import { formatTime, formatDuration } from '@/lib/time';

interface ClockCardProps {
  currentTime: Date;
  isClockedIn: boolean;
  onClockIn: () => void;
  onClockOut: () => void;
  onEndDay: () => void;
  totalWorkTodayMs: number;
  totalBreakTodayMs: number;
  dailyLimitHours: number;
  clockInTime?: string;
  wfhDaysUsed: number;
  monthlyWfhLimit: number;
  todaysWfhType?: 'full' | 'half';
  onLogWfh: (type: 'full' | 'half') => void;
  onUndoWfh: () => void;
}

export default function ClockCard({
  currentTime,
  isClockedIn,
  onClockIn,
  onClockOut,
  onEndDay,
  totalWorkTodayMs,
  totalBreakTodayMs,
  dailyLimitHours,
  clockInTime,
  wfhDaysUsed,
  monthlyWfhLimit,
  todaysWfhType,
  onLogWfh,
  onUndoWfh,
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
            {todaysWfhType ? (
                <>
                    <p className="text-muted-foreground pb-2">🏠 Logged as</p>
                    <p className="text-3xl font-semibold capitalize">{todaysWfhType} Day WFH</p>
                </>
            ) : isClockedIn && clockInTime ? (
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

        <div className="flex flex-col sm:flex-row items-center gap-4">
            {todaysWfhType ? (
                 <Button
                    size="lg"
                    className="w-56 h-16 text-xl rounded-full shadow-lg transition-transform transform hover:scale-105"
                    onClick={onUndoWfh}
                    variant="outline"
                >
                    Undo WFH
                </Button>
            ) : !isClockedIn ? (
                <div className="flex flex-col items-center gap-2">
                     <Button
                        size="lg"
                        className="w-56 h-16 text-xl rounded-full shadow-lg transition-transform transform hover:scale-105"
                        onClick={onClockIn}
                    >
                        <LogIn className="mr-3 h-7 w-7" /> Clock In
                    </Button>
                    <div className="flex gap-2 mt-2">
                        <button 
                            onClick={() => onLogWfh('full')}
                            className="text-xs transition-colors px-3 py-1.5 rounded-full text-muted-foreground hover:bg-secondary border border-border/50"
                        >
                            🏠 Log Full WFH
                        </button>
                        <button 
                            onClick={() => onLogWfh('half')}
                            className="text-xs transition-colors px-3 py-1.5 rounded-full text-muted-foreground hover:bg-secondary border border-border/50"
                        >
                            Log Half WFH
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <Button
                        size="lg"
                        className="w-56 h-16 text-xl rounded-full shadow-lg transition-transform transform hover:scale-105"
                        onClick={onClockOut}
                        variant="destructive"
                    >
                        <LogOut className="mr-3 h-7 w-7" /> Clock Out
                    </Button>
                     <Button
                        size="lg"
                        className="w-56 h-16 text-xl rounded-full shadow-lg transition-transform transform hover:scale-105"
                        onClick={onEndDay}
                        variant="secondary"
                    >
                        <DoorOpen className="mr-3 h-7 w-7" /> End Day
                    </Button>
                </>
            )}
        </div>


        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 w-full text-center pt-6 max-w-3xl mx-auto">
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
            <p className="text-sm text-muted-foreground uppercase tracking-wider">Break</p>
            <p className="text-2xl sm:text-3xl font-bold font-mono">{formatDuration(totalBreakTodayMs)}</p>
          </div>
          <div className="bg-background/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground uppercase tracking-wider">Overtime</p>
            <p className={`text-2xl sm:text-3xl font-bold font-mono ${overtimeMs > 0 ? 'text-destructive' : ''}`}>
              {formatDuration(overtimeMs)}
            </p>
          </div>
        </div>

        {/* WFH Month Tracker */}
        <div className="w-full max-w-3xl mx-auto pt-4 text-center">
             <div className="inline-flex items-center gap-2 bg-background/50 px-4 py-2 rounded-full text-sm font-medium border border-border/50">
                 🏠 WFH Days Used This Month: 
                 <span className={`${wfhDaysUsed >= monthlyWfhLimit ? 'text-destructive font-bold' : 'text-primary'}`}>
                    {wfhDaysUsed} / {monthlyWfhLimit}
                 </span>
             </div>
        </div>
      </CardContent>
    </Card>
  );
}
