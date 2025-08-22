
"use client";

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import DailySummary from './daily-summary';
import type { TimeEntry } from '@/types';
import jsPDF from 'jspdf';
import { calculateDailySummary, formatTime, formatDuration, formatDate } from '@/lib/time';

interface EndDayDialogProps {
  isOpen: boolean;
  onClose: () => void;
  entries: TimeEntry[];
  selectedDate: Date;
}

export default function EndDayDialog({ isOpen, onClose, entries, selectedDate }: EndDayDialogProps) {
    
    const handleDownloadPdf = () => {
        const summary = calculateDailySummary(entries, selectedDate);
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text(`Daily Summary - ${formatDate(selectedDate)}`, 14, 22);

        doc.setFontSize(12);
        doc.text(`Total Work: ${formatDuration(summary.totalWork)}`, 14, 32);
        doc.text(`Total Break: ${formatDuration(summary.totalBreak)}`, 14, 40);
        doc.text(`First Clock-In: ${summary.firstClockIn ? formatTime(summary.firstClockIn) : 'N/A'}`, 14, 48);
        doc.text(`Last Clock-Out: ${summary.lastClockOut ? formatTime(summary.lastClockOut) : 'N/A'}`, 14, 56);
        
        if (summary.entries.length > 0) {
            doc.setFontSize(14);
            doc.text("Entries:", 14, 70);
            let y = 78;
            summary.entries.forEach(entry => {
                doc.setFontSize(10);
                const clockIn = `IN: ${formatTime(entry.clockIn)}`;
                const clockOut = entry.clockOut ? `OUT: ${formatTime(entry.clockOut)}` : 'OUT: In Progress';
                doc.text(`${clockIn} - ${clockOut}`, 14, y);
                y += 6;
            });
        }

        if (summary.breaks.length > 0) {
            doc.setFontSize(14);
            doc.text("Breaks:", 14, 110);
            let y = 118;
            summary.breaks.forEach(b => {
                doc.setFontSize(10);
                const start = `START: ${formatTime(b.start)}`;
                const end = `END: ${formatTime(b.end)}`;
                const duration = `DURATION: ${formatDuration(b.duration)}`;
                doc.text(`${start} - ${end} (${duration})`, 14, y);
                y += 6;
            });
        }
        
        doc.save(`TimeFlow-Summary-${selectedDate.toISOString().split('T')[0]}.pdf`);
    };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Daily Report</DialogTitle>
          <DialogDescription>
            Here is your summary for the day. You can download it as a PDF.
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-4 bg-background max-h-[60vh] overflow-y-auto">
             <div className="p-4 bg-white text-black light">
                <DailySummary entries={entries} selectedDate={selectedDate} />
             </div>
        </div>

        <DialogFooter className="mt-4">
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button onClick={handleDownloadPdf}>Download PDF</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
