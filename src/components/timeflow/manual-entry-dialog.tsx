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

const formSchema = z.object({
  clockIn: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  clockOut: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
}).refine(data => new Date(data.clockIn) < new Date(data.clockOut), {
  message: "Clock out must be after clock in",
  path: ["clockOut"],
});


interface ManualEntryDialogProps {
  children: React.ReactNode;
  onSave: (entry: { clockIn: string; clockOut: string }) => void;
}

export default function ManualEntryDialog({ children, onSave }: ManualEntryDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clockIn: "",
      clockOut: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onSave(values);
    form.reset();
  }

  return (
    <Dialog onOpenChange={(open) => !open && form.reset()}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manual Time Entry</DialogTitle>
          <DialogDescription>
            Forgot to clock in or out? Add your entry here.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
