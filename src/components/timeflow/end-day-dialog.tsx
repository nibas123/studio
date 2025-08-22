
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

interface EndDayDialogProps {
  isOpen: boolean;
  onClose: () => void;
  entries: TimeEntry[];
  selectedDate: Date;
}

export default function EndDayDialog({ isOpen, onClose, entries, selectedDate }: EndDayDialogProps) {
    const summaryRef = React.useRef<HTMLDivElement>(null);

    const handleDownloadPdf = () => {
        const content = summaryRef.current;
        if (!content) return;

        const doc = new jsPDF({
            orientation: 'p',
            unit: 'px',
            format: 'a4'
        });
        
        doc.html(content, {
            callback: function (doc) {
                doc.save(`TimeFlow-Summary-${selectedDate.toISOString().split('T')[0]}.pdf`);
            },
            x: 10,
            y: 10,
            html2canvas: {
                scale: 0.2, // Adjust scale to fit content on the page
                backgroundColor: '#ffffff'
            },
            margin: [10, 10, 10, 10]
        });
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
        
        <div className="p-4 bg-background">
             <div ref={summaryRef} className="p-4 bg-white text-black">
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
