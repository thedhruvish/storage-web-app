// components/ui/data-table/filters/date-range-filter.tsx
"use client";

import * as React from "react";
import { addDays, format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// components/ui/data-table/filters/date-range-filter.tsx

interface DateRangeFilterProps {
  column: any; // Column<any, unknown> from TanStack
}

export function DateRangeFilter({ column }: DateRangeFilterProps) {
  const value = column.getFilterValue() as
    | [string | undefined, string | undefined]
    | undefined;
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    value?.[0] && value?.[1]
      ? { from: new Date(value[0]), to: new Date(value[1]) }
      : undefined
  );

  const handleSelect = (range?: DateRange) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      column.setFilterValue([range.from.toISOString(), range.to.toISOString()]);
    } else {
      column.setFilterValue(undefined);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className={cn(
            "w-full justify-start text-left font-normal",
            !dateRange && "text-muted-foreground"
          )}
        >
          <CalendarIcon className='mr-2 h-4 w-4' />
          {dateRange?.from ? (
            dateRange.to ? (
              <>
                {format(dateRange.from, "LLL dd, y")} –{" "}
                {format(dateRange.to, "LLL dd, y")}
              </>
            ) : (
              format(dateRange.from, "LLL dd, y")
            )
          ) : (
            <span>Pick a range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar
          initialFocus
          mode='range'
          defaultMonth={dateRange?.from}
          selected={dateRange}
          onSelect={handleSelect}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
