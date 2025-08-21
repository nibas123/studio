"use client";

import type { TimeEntry } from '@/types';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Save, X, LogIn, LogOut } from 'lucide-react';
import { formatDateTime, formatDuration, calculateEntryDuration } from '@/lib/time';
import { Input } from '../ui/input';

interface HistoryCardProps {
  entries: TimeEntry[];
  onDelete: (id: string) => void;
  onUpdate: (entry: TimeEntry) => void;
}

export default function HistoryCard({ entries, onDelete, onUpdate }: HistoryCardProps) {
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ clockIn: string; clockOut: string }>({ clockIn: '', clockOut: '' });

  const handleEdit = (entry: TimeEntry) => {
    setEditingEntryId(entry.id);
    setEditValues({
      clockIn: new Date(entry.clockIn).toISOString().slice(0, 16),
      clockOut: entry.clockOut ? new Date(entry.clockOut).toISOString().slice(0, 16) : '',
    });
  };

  const handleCancelEdit = () => {
    setEditingEntryId(null);
  };

  const handleSaveEdit = (id: string) => {
    onUpdate({
      id,
      clockIn: new Date(editValues.clockIn).toISOString(),
      clockOut: new Date(editValues.clockOut).toISOString(),
    });
    setEditingEntryId(null);
  };

  const renderEntryActions = (entry: TimeEntry, isMobile: boolean = false) => (
    <div className="flex justify-end items-center mt-2 sm:mt-0 sm:justify-end">
        {editingEntryId === entry.id ? (
            <>
                <Button variant="ghost" size="icon" onClick={() => handleSaveEdit(entry.id)}><Save className="h-4 w-4 text-green-500" /></Button>
                <Button variant="ghost" size="icon" onClick={handleCancelEdit}><X className="h-4 w-4" /></Button>
            </>
        ) : (
            <>
                <Button variant="ghost" size="icon" onClick={() => handleEdit(entry)} disabled={!entry.clockOut}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(entry.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </>
        )}
    </div>
  );

  return (
    <Card className="shadow-lg border-none bg-card/50">
      <CardHeader>
        <CardTitle>Today's History</CardTitle>
        <CardDescription>A summary of your work sessions for today.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Mobile View */}
        <div className="sm:hidden">
          {entries.length > 0 ? (
            <div className="space-y-4">
              {entries.map((entry) => (
                 <div key={entry.id} className="border rounded-lg p-4 space-y-3 bg-background/50">
                    {editingEntryId === entry.id ? (
                       <>
                          <div className="space-y-2">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Clock In</label>
                                <Input type="datetime-local" value={editValues.clockIn} onChange={e => setEditValues({...editValues, clockIn: e.target.value})} />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Clock Out</label>
                                <Input type="datetime-local" value={editValues.clockOut} onChange={e => setEditValues({...editValues, clockOut: e.target.value})} />
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-2">
                             <div className="text-sm font-mono text-primary">{formatDuration(calculateEntryDuration({clockIn: editValues.clockIn, clockOut: editValues.clockOut}))}</div>
                             {renderEntryActions(entry, true)}
                          </div>
                       </>
                    ) : (
                        <>
                           <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Entry</span>
                                {renderEntryActions(entry, true)}
                           </div>
                           <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <LogIn className="h-4 w-4 text-green-500" />
                                    <span className="font-medium">{formatDateTime(entry.clockIn)}</span>
                                </div>
                           </div>
                           <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <LogOut className="h-4 w-4 text-red-500" />
                                    <span className="font-medium">{entry.clockOut ? formatDateTime(entry.clockOut) : 'In Progress'}</span>
                                </div>
                                <span className="font-mono text-sm text-primary">{formatDuration(calculateEntryDuration(entry))}</span>
                           </div>
                        </>
                    )}
                 </div>
              ))}
            </div>
          ) : (
             <p className="text-center text-muted-foreground py-4">No entries for today yet.</p>
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden sm:block">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead className="text-right">Duration</TableHead>
                <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {entries.length > 0 ? (
                entries.map((entry) => (
                    <TableRow key={entry.id}>
                    {editingEntryId === entry.id ? (
                        <>
                        <TableCell>
                            <Input type="datetime-local" value={editValues.clockIn} onChange={e => setEditValues({...editValues, clockIn: e.target.value})} />
                        </TableCell>
                        <TableCell>
                            <Input type="datetime-local" value={editValues.clockOut} onChange={e => setEditValues({...editValues, clockOut: e.target.value})} />
                        </TableCell>
                        <TableCell className="text-right font-mono">
                            {formatDuration(calculateEntryDuration({clockIn: editValues.clockIn, clockOut: editValues.clockOut}))}
                        </TableCell>
                        <TableCell className="text-right">
                           {renderEntryActions(entry)}
                        </TableCell>
                        </>
                    ) : (
                        <>
                        <TableCell>{formatDateTime(entry.clockIn)}</TableCell>
                        <TableCell>{entry.clockOut ? formatDateTime(entry.clockOut) : 'In Progress'}</TableCell>
                        <TableCell className="text-right font-mono">{formatDuration(calculateEntryDuration(entry))}</TableCell>
                        <TableCell className="text-right">
                           {renderEntryActions(entry)}
                        </TableCell>
                        </>
                    )}
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">No entries for today yet.</TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
