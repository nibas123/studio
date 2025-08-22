
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
import html2canvas from 'html2canvas';
import { formatDate } from '@/lib/time';

interface EndDayDialogProps {
  isOpen: boolean;
  onClose: () => void;
  entries: TimeEntry[];
  selectedDate: Date;
}

export default function EndDayDialog({ isOpen, onClose, entries, selectedDate }: EndDayDialogProps) {
    
    const handleDownloadPdf = () => {
        const summaryElement = document.getElementById('pdf-summary');
        if (!summaryElement) {
            console.error("Summary element not found for PDF generation.");
            return;
        }

        // Temporarily make it visible to capture
        summaryElement.style.display = 'block';
        
        html2canvas(summaryElement, { 
            scale: 2, // Higher scale for better quality
            useCORS: true,
            backgroundColor: null, // Use element's background
        }).then(canvas => {
            // Hide it again after capture
            summaryElement.style.display = 'none';

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });
            
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`TimeFlow-Summary-${formatDate(selectedDate)}.pdf`);
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
        
         <div className="max-h-[60vh] overflow-y-auto p-1">
             <DailySummary entries={entries} selectedDate={selectedDate} />
        </div>

        {/* Hidden, styled element for PDF generation */}
        <div style={{ position: 'fixed', left: '-9999px', top: '-9999px', display: 'none' }}>
            <div id="pdf-summary" className="p-4 light bg-white text-black" style={{ width: '800px' }}>
                <h1 className="text-2xl font-bold mb-2">Daily Report for {formatDate(selectedDate)}</h1>
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
