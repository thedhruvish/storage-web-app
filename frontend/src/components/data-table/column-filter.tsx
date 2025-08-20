"use client";

import type { Column } from "@tanstack/react-table";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DataTableFacetedFilter } from "./faceted-filter";
import { DataTableNumberRangeFilter } from "./number-range-filter";

interface ColumnFilterProps<TData> {
  column: Column<TData, unknown>;
}

export function ColumnFilter<TData>({ column }: ColumnFilterProps<TData>) {
  const variant = column.columnDef.meta?.filterVariant;
  if (!variant) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='ghost' size='sm' className='ml-1 h-6 w-6 p-0'>
          <Filter className='h-3 w-3 text-muted-foreground' />
        </Button>
      </PopoverTrigger>

      <PopoverContent side='bottom' align='start' className='w-52 p-3'>
        {(() => {
          switch (variant) {
            case "text":
              return (
                <Input
                  placeholder='Filter...'
                  value={(column.getFilterValue() ?? "") as string}
                  onChange={(e) => column.setFilterValue(e.target.value)}
                />
              );

            case "select":
              return (
                <DataTableFacetedFilter
                  column={column}
                  title={column.columnDef.header as string}
                  options={column.columnDef.meta?.selectOptions ?? []}
                />
              );

            case "numberRange":
              return <DataTableNumberRangeFilter column={column} />;

            default:
              return null;
          }
        })()}
      </PopoverContent>
    </Popover>
  );
}
