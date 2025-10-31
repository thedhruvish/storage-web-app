import * as React from "react";
import { format, setHours, setMinutes, setSeconds } from "date-fns";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// 1. Define the props it will receive from react-hook-form's <FormField>
interface DateTimePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  disabled?: boolean;
}

// 2. Renamed to DateTimePicker for clarity
export function DateTimePicker({
  value,
  onChange,
  disabled,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Extract the time part for the time input
  const timeValue = React.useMemo(() => {
    if (!value) return "00:00:00";
    return format(value, "HH:mm:ss"); // e.g., "10:30:00"
  }, [value]);

  // Handler for when the date is selected from the calendar
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      onChange(undefined); // Clear the date
      setOpen(false);
      return;
    }

    // Get time from existing value, or default to 00:00
    const [hours, minutes, seconds] = timeValue.split(":").map(Number);

    // Create a new date object with the new date and existing time
    let newDate = setSeconds(
      setMinutes(setHours(selectedDate, hours), minutes),
      seconds
    );

    onChange(newDate);
    setOpen(false);
  };

  // Handler for when the time input changes
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    if (!newTime) return;

    // Get date from existing value, or default to today
    const baseDate = value ? new Date(value) : new Date();

    const [hours, minutes, seconds] = newTime.split(":").map(Number);

    // Create a new date object with the existing date and new time
    let newDate = setSeconds(
      setMinutes(setHours(baseDate, hours), minutes),
      seconds || 0
    );

    onChange(newDate);
  };

  return (
    <div className='flex gap-4'>
      {/* Date Picker */}
      <div className='flex flex-col gap-3'>
        <Label htmlFor='date-picker' className='px-1'>
          Date
        </Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              id='date-picker'
              className={cn(
                "w-40 justify-between font-normal",
                !value && "text-muted-foreground"
              )}
              disabled={disabled}
            >
              {/* 3. Use 'value' prop for display */}
              {value ? format(value, "PPP") : "Select date"}
              <ChevronDownIcon className='ml-2 h-4 w-4' />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto overflow-hidden p-0' align='start'>
            <Calendar
              mode='single'
              selected={value} // 3. Use 'value' prop
              onSelect={handleDateSelect} // 4. Use new handler
              disabled={(date) =>
                disabled || // Check if the whole component is disabled
                date < new Date(new Date().setHours(0, 0, 0, 0))
              }
              autoFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Time Picker */}
      <div className='flex flex-col gap-3'>
        <Label htmlFor='time-picker' className='px-1'>
          Time
        </Label>
        <Input
          type='time'
          id='time-picker'
          step='1' // For seconds
          value={timeValue} // 3. Use calculated time value
          onChange={handleTimeChange} // 4. Use new handler
          disabled={disabled}
          className='bg-background'
        />
      </div>
    </div>
  );
}
