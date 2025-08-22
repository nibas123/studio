
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
import { formatDate, formatTime, formatDuration, calculateDailySummary, calculateEntryDuration } from '@/lib/time';

interface EndDayDialogProps {
  isOpen: boolean;
  onClose: () => void;
  entries: TimeEntry[];
  selectedDate: Date;
}

export default function EndDayDialog({ isOpen, onClose, entries, selectedDate }: EndDayDialogProps) {
    
    const handleDownloadPdf = () => {
        const doc = new jsPDF();
        const summary = calculateDailySummary(entries, selectedDate);

        // Add a title
        doc.setFontSize(18);
        doc.text(`Daily Report for ${formatDate(selectedDate)}`, 14, 22);

        // Summary Section
        doc.setFontSize(12);
        doc.text("Summary", 14, 32);
        doc.line(14, 33, 200, 33); // separator line
        let y = 40;
        doc.text(`Total Work: ${formatDuration(summary.totalWork)}`, 14, y);
        y += 7;
        doc.text(`Total Break: ${formatDuration(summary.totalBreak)}`, 14, y);
        y += 7;
        doc.text(`First Clock In: ${summary.firstClockIn ? formatTime(summary.firstClockIn) : 'N/A'}`, 14, y);
        y += 7;
        doc.text(`Last Clock Out: ${summary.lastClockOut ? formatTime(summary.lastClockOut) : 'N/A'}`, 14, y);
        y += 10;
        
        // Time Entries Section
        if (summary.entries.length > 0) {
            doc.text("Time Entries", 14, y);
            doc.line(14, y + 1, 200, y + 1); // separator line
            y += 8;

            summary.entries.forEach(entry => {
                const clockIn = `IN: ${formatTime(entry.clockIn)}`;
                const clockOut = entry.clockOut ? `OUT: ${formatTime(entry.clockOut)}` : 'OUT: In Progress';
                const duration = `DURATION: ${formatDuration(calculateEntryDuration(entry))}`;
                doc.text(`${clockIn} - ${clockOut} (${duration})`, 14, y);
                y += 6;
            });
            y += 4;
        }

        // Breaks Section
        if (summary.breaks.length > 0) {
            doc.text("Breaks", 14, y);
            doc.line(14, y + 1, 200, y + 1); // separator line
            y += 8;

            summary.breaks.forEach(b => {
                const breakStart = `START: ${formatTime(b.start)}`;
                const breakEnd = `END: ${formatTime(b.end)}`;
                const duration = `DURATION: ${formatDuration(b.duration)}`;
                doc.text(`${breakStart} - ${breakEnd} (${duration})`, 14, y);
                y += 6;
            });
        }
        
        doc.save(`TimeFlow-Summary-${formatDate(selectedDate)}.pdf`);
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
        
         <div className="max-h-[60vh] overflow-y-auto p-1">
             <DailySummary entries={entries} selectedDate={selectedDate} />
        </div>

        <DialogFooter className="mt-4">
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button onClick={handleDownloadPdf}>Download PDF</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
