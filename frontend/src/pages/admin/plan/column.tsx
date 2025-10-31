import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { formatFileSize } from "@/utils/functions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Plan } from "./schema";

// Formats number as INR currency
const formatINR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
});

// Formats number as USD currency
const formatUSD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const getColumns = (
  handleDelete: (planId: string) => void,
  handleToggleActive: (planId: string) => void
): ColumnDef<Plan>[] => [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className='max-w-[300px] truncate'>
        {row.getValue("description")}
      </div>
    ),
  },
  {
    accessorKey: "priceINR",
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Price (INR)
        <ArrowUpDown className='ml-2 h-4 w-4' />
      </Button>
    ),
    cell: ({ row }) => formatINR.format(row.getValue("priceINR")),
  },
  {
    accessorKey: "priceUSD",
    header: "Price (USD)",
    cell: ({ row }) => formatUSD.format(row.getValue("priceUSD")),
  },
  {
    accessorKey: "interval",
    header: "Interval",
    cell: ({ row }) => {
      const interval = row.getValue("interval") as string;
      return (
        <span className='capitalize'>
          {interval === "month" ? "Monthly" : "Yearly"}
        </span>
      );
    },
  },
  {
    accessorKey: "totalBytes",
    header: "Storage",
    cell: ({ row }) => formatFileSize(row.getValue("totalBytes")),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive");
      return (
        <Badge variant={isActive ? "default" : "outline"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const plan = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleToggleActive(plan._id)}>
              {plan.isActive ? "Deactivate" : "Activate"}
            </DropdownMenuItem>
            <DropdownMenuItem
              className='text-red-600'
              onClick={() => handleDelete(plan._id)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
