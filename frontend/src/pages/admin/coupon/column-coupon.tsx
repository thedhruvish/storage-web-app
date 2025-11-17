import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Coupon } from "./coupon-schema";

// Formats number as INR currency
// const formatINR = new Intl.NumberFormat("en-IN", {
//   style: "currency",
//   currency: "INR",
// });

// Formats number as USD currency
const formatUSD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
// {
//   "id": "FREETRY",
//   "amount_off": 2000,
//   "created": 1761840421,
//   "duration": "repeating",
//   "max_redemptions": null,
//   "percent_off": null
// }

export const getColumnsCoupon = (
  handleDelete: (planId: string) => void
): ColumnDef<Coupon>[] => [
  {
    accessorKey: "id",
    header: "Code",
  },
  {
    accessorKey: "amount_off",
    header: "Price (USD)",
    cell: ({ row }) => {
      const plan = row.original;
      return formatUSD.format(plan.amount_off / 100);
    },
  },
  {
    accessorKey: "percent_off",
    header: "percent_off",
    cell: ({ row }) => row.getValue("percent_off") + "%",
  },
  {
    accessorKey: "created",
    header: "created at",
    cell: ({ row }) => {
      const created = row.original;
      return new Date(created.created * 1000).toLocaleString();
    },
  },
  {
    accessorKey: "max_redemptions",
    header: "max_redemptions",
    cell: ({ row }) => row.getValue("max_redemptions") || "Unlimited",
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

            <DropdownMenuItem
              className='text-red-600'
              onClick={() => handleDelete(plan.id)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
