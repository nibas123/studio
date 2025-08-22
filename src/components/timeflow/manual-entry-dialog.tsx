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
import { useEffect } from 'react';

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
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (isClockedIn) {
      form.reset({
        clockIn: undefined,
        clockOut: toLocalISOString(new Date()),
      });
    } else {
      form.reset({
        clockIn: toLocalISOString(new Date()),
        clockOut: toLocalISOString(new Date()),
      });
    }
  }, [isClockedIn, form]);


  function onSubmit(values: z.infer<typeof formSchema>) {
    onSave(values);
  }

  return (
    <Dialog onOpenChange={(open) => {
      if (!open) {
        form.reset();
      } else {
        if (isClockedIn) {
          form.reset({
            clockIn: undefined,
            clockOut: toLocalISOString(new Date()),
          });
        } else {
          form.reset({
            clockIn: toLocalISOString(new Date()),
            clockOut: toLocalISOString(new Date()),
          });
        }
      }
    }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manual Time Entry</DialogTitle>
          <DialogDescription>
            {isClockedIn 
              ? "You are currently clocked in. Add a clock out time to complete your entry."
              : "Forgot to clock in or out? Add your new entry here."
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
                    <Button type="submit">Save Entry</Button>
                </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
