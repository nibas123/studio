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
  time: z.string().nonempty({ message: "Time is required." }),
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
      time: '',
    },
  });
  
  useEffect(() => {
    if(isOpen) {
      form.reset({
          time: toLocalISOString(new Date()),
      });
    }
  }, [isOpen, form]);


  function onSubmit(values: z.infer<typeof formSchema>) {
    if (isClockedIn) {
        onSave({ clockOut: values.time });
    } else {
        onSave({ clockIn: values.time });
    }
    setIsOpen(false);
  }

  const title = isClockedIn ? "Manual Clock Out" : "Manual Clock In";
  const description = isClockedIn 
    ? "You are currently clocked in. Enter a clock out time to complete your current entry."
    : "You are currently clocked out. Enter a clock in time to start a new entry.";
  const label = isClockedIn ? "Clock Out Time" : "Clock In Time";

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
            <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
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
