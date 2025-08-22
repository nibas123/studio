"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useEffect, useState } from 'react';

const formSchema = z.object({
  clockIn: z.string().optional(),
  clockOut: z.string().optional(),
}).refine(data => {
  if (data.clockIn && data.clockOut) {
    return new Date(data.clockIn) < new Date(data.clockOut);
  }
  return true;
}, {
  message: "Clock out must be after clock in",
  path: ["clockOut"],
});


interface ManualEntryDialogProps {
  children: React.ReactNode;
  onSave: (entry: { clockIn?: string; clockOut?: string }) => void;
  isClockedIn: boolean;
}

const toLocalISOString = (date: Date) => {
    const tzoffset = date.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(date.getTime() - tzoffset)).toISOString().slice(0, 16);
    return localISOTime;
}

export default function ManualEntryDialog({ children, onSave, isClockedIn }: ManualEntryDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clockIn: '',
      clockOut: '',
    },
  });
  
  useEffect(() => {
    if(isOpen) {
      const now = toLocalISOString(new Date());
      if (isClockedIn) {
        form.reset({
          clockIn: undefined,
          clockOut: now,
        });
      } else {
        form.reset({
          clockIn: now,
          clockOut: now,
        });
      }
    }
  }, [isOpen, isClockedIn, form]);


  function onSubmit(values: z.infer<typeof formSchema>) {
    onSave(values);
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manual Time Entry</DialogTitle>
          <DialogDescription>
            {isClockedIn 
              ? "You are currently clocked in. Add a clock out time to complete your current entry."
              : "Forgot to record a work session? Add a complete entry here."
            }
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            {!isClockedIn && (
              <FormField
                control={form.control}
                name="clockIn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clock In</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="clockOut"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clock Out</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
                <Button type="submit">Save Entry</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
