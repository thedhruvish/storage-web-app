"use client";

import { useState } from "react";
import type { Column } from "@tanstack/react-table";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DataTableNumberRangeFilterProps<TData> {
  column: Column<TData, unknown>;
}

export function DataTableNumberRangeFilter<TData>({
  column,
}: DataTableNumberRangeFilterProps<TData>) {
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");

  const apply = () => {
    column.setFilterValue({
      min: Number(min) || undefined,
      max: Number(max) || undefined,
    });
  };

  const clear = () => {
    setMin("");
    setMax("");
    column.setFilterValue(undefined);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' size='sm' className='h-8'>
          <Filter className='mr-2 h-4 w-4' />
          Filter
        </Button>
      </PopoverTrigger>
      <PopoverContent side='bottom' align='start' className='w-52 p-3'>
        <div className='grid gap-3'>
          <div className='grid gap-1.5'>
            <Label htmlFor='min'>Min</Label>
            <Input
              id='min'
              placeholder='0'
              value={min}
              onChange={(e) => setMin(e.target.value)}
            />
          </div>
          <div className='grid gap-1.5'>
            <Label htmlFor='max'>Max</Label>
            <Input
              id='max'
              placeholder='9999'
              value={max}
              onChange={(e) => setMax(e.target.value)}
            />
          </div>
          <div className='flex gap-2'>
            <Button size='sm' onClick={apply}>
              Apply
            </Button>
            <Button size='sm' variant='ghost' onClick={clear}>
              Clear
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
