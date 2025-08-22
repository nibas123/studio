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
import { calculateDailySummary, formatTime, formatDuration, formatDate, calculateEntryDuration } from '@/lib/time';

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

        let y = 22; // Initial Y position

        // Title
        doc.setFontSize(18);
        doc.text(`Daily Summary - ${formatDate(selectedDate)}`, 14, y);
        y += 10;

        // Summary Metrics
        doc.setFontSize(12);
        doc.text(`Total Work: ${formatDuration(summary.totalWork)}`, 14, y);
        y += 8;
        doc.text(`Total Break: ${formatDuration(summary.totalBreak)}`, 14, y);
        y += 8;
        doc.text(`First Clock-In: ${summary.firstClockIn ? formatTime(summary.firstClockIn) : 'N/A'}`, 14, y);
        y += 8;
        doc.text(`Last Clock-Out: ${summary.lastClockOut ? formatTime(summary.lastClockOut) : 'N/A'}`, 14, y);
        y += 14;
        
        // Entries section
        if (summary.entries.length > 0) {
            doc.setFontSize(14);
            doc.text("Entries:", 14, y);
            y += 8;
            summary.entries.forEach(entry => {
                if (y > 280) { // Add new page if content overflows
                    doc.addPage();
                    y = 20;
                }
                doc.setFontSize(10);
                const clockIn = `IN: ${formatTime(entry.clockIn)}`;
                const clockOut = entry.clockOut ? `OUT: ${formatTime(entry.clockOut)}` : 'OUT: In Progress';
                const duration = `DURATION: ${formatDuration(calculateEntryDuration(entry))}`;
                doc.text(`${clockIn} - ${clockOut} (${duration})`, 14, y);
                y += 6;
            });
        }
        
        y += 10; // Add space before next section

        // Breaks section
        if (summary.breaks.length > 0) {
            if (y > 280) {
                doc.addPage();
                y = 20;
            }
            doc.setFontSize(14);
            doc.text("Breaks:", 14, y);
            y += 8;
            summary.breaks.forEach(b => {
                 if (y > 280) {
                    doc.addPage();
                    y = 20;
                }
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
        
         <div className="max-h-[60vh] overflow-y-auto p-1">
             <div className="p-4 light bg-white text-black">
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
