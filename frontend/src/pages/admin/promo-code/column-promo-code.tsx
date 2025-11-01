import { DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PromoCode } from "./promocode-schema";

export const getColumnsPromoCode = (
  handleToggleActive: (planId: string, isActive: boolean) => void
): ColumnDef<PromoCode>[] => [
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => (
      <div className='max-w-[300px] truncate'>{row.getValue("code")}</div>
    ),
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
    accessorKey: "times_redeemed",
    header: "Times Redeemed",
    cell: ({ row }) => row.getValue("times_redeemed"),
  },
  {
    accessorKey: "active",
    header: "Status",
    cell: ({ row }) => {
      const active = row.getValue("active");
      return (
        <Badge variant={active ? "default" : "outline"}>
          {active ? "Active" : "Inactive"}
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
            <DropdownMenuItem
              onClick={() => handleToggleActive(plan.id, plan.active)}
            >
              {plan.active ? "Deactivate" : "Activate"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
