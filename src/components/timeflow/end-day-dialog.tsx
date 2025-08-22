
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
            format: [content.offsetWidth, content.offsetHeight]
        });

        doc.html(content, {
            callback: function (doc) {
                doc.save(`TimeFlow-Summary-${selectedDate.toISOString().split('T')[0]}.pdf`);
            },
            x: 0,
            y: 0,
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
        
        <div ref={summaryRef} className="p-4 bg-background">
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
