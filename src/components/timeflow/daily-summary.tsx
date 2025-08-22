
"use client";

import type { TimeEntry } from '@/types';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { calculateDailySummary, formatDuration, formatTime } from '@/lib/time';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Briefcase, Coffee, ArrowRight, Clock } from 'lucide-react';
import HistoryCard from './history-card';


interface DailySummaryProps {
  entries: TimeEntry[];
  selectedDate: Date;
  onUpdate: (entry: TimeEntry) => void;
  onDelete: (id: string) => void;
}

const SummaryItem = ({ icon, label, value, className = "" }: { icon: React.ElementType, label: string, value: string, className?: string }) => (
    <div className={`flex flex-col p-4 bg-background/50 rounded-lg text-center ${className}`}>
        <div className="flex items-center justify-center gap-2 mb-2">
            {React.createElement(icon, { className: "h-5 w-5 text-muted-foreground" })}
            <span className="text-sm text-muted-foreground uppercase tracking-wider">{label}</span>
        </div>
        <span className="text-2xl font-bold font-mono">{value}</span>
    </div>
);


export default function DailySummary({ entries, selectedDate, onUpdate, onDelete }: DailySummaryProps) {
  const summary = useMemo(() => calculateDailySummary(entries, selectedDate), [entries, selectedDate]);

  if (summary.entries.length === 0) {
    return (
        <Card className="shadow-lg border-none bg-card/50">
            <CardHeader>
                <CardTitle>Daily Summary</CardTitle>
                 <CardDescription>No entries recorded for this day.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-center text-muted-foreground py-8">Select another day to see its summary.</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <div className="space-y-6">
        <Card className="shadow-lg border-none bg-card/50">
            <CardHeader>
                <CardTitle>Daily Summary</CardTitle>
                <CardDescription>An overview of your activity for the selected day.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <SummaryItem icon={Briefcase} label="Total Work" value={formatDuration(summary.totalWork)} />
                    <SummaryItem icon={Coffee} label="Total Break" value={formatDuration(summary.totalBreak)} />
                    <SummaryItem icon={Clock} label="First Clock-In" value={summary.firstClockIn ? formatTime(summary.firstClockIn) : 'N/A'} />
                    <SummaryItem icon={Clock} label="Last Clock-Out" value={summary.lastClockOut ? formatTime(summary.lastClockOut) : 'N/A'} />
                </div>

                {/* Work/Break Percentage */}
                <div>
                    <div className="flex justify-between mb-1 text-sm font-medium">
                        <span className="text-primary">Work ({summary.workPercentage}%)</span>
                        <span className="text-muted-foreground">Break ({summary.breakPercentage}%)</span>
                    </div>
                    <Progress value={summary.workPercentage} className="h-3" />
                </div>

                {/* Breaks List */}
                {summary.breaks.length > 0 && (
                     <div>
                        <h4 className="text-lg font-semibold mb-2">Breaks Taken ({summary.breaks.length})</h4>
                        <div className="space-y-3">
                            {summary.breaks.map((b, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <Coffee className="h-5 w-5 text-muted-foreground"/>
                                        <div className="flex items-center gap-2 font-mono text-sm">
                                            <span>{formatTime(b.start)}</span>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground"/>
                                            <span>{formatTime(b.end)}</span>
                                        </div>
                                    </div>
                                    <span className="font-mono text-sm font-semibold">{formatDuration(b.duration)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>

        {/* Entries Table */}
        <HistoryCard entries={summary.entries} onDelete={onDelete} onUpdate={onUpdate} />
    </div>
  );
}

