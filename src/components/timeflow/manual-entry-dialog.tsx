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
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useEffect, useState } from 'react';

const clockInSchema = z.object({
  clockIn: z.string().nonempty({ message: "Time is required." }),
  clockOut: z.string().optional(),
});

const clockOutSchema = z.object({
    clockOut: z.string().nonempty({ message: "Time is required." }),
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
  
  const form = useForm({
    resolver: zodResolver(isClockedIn ? clockOutSchema : clockInSchema),
    defaultValues: {
      clockIn: '',
      clockOut: '',
    },
  });
  
  useEffect(() => {
    if(isOpen) {
      const now = toLocalISOString(new Date());
      if (isClockedIn) {
          form.reset({ clockOut: now });
      } else {
          form.reset({ clockIn: now, clockOut: now });
      }
    }
  }, [isOpen, isClockedIn, form]);


  function onSubmit(values: any) {
    onSave(values);
    setIsOpen(false);
  }
  
  const title = isClockedIn ? "Manual Clock Out" : "Manual Time Entry";
  const description = isClockedIn 
    ? "You are currently clocked in. Enter a clock out time to complete your current session."
    : "Forgot to record a work session? Add a complete entry here.";
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
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
                        <Input type="datetime-local" {...field} />
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
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Close</Button>
                </DialogClose>
                <Button type="submit">Save Entry</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
