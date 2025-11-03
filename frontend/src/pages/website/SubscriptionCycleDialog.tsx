import { ExternalLinkIcon, X } from "lucide-react";
import type { ApiSubscription } from "@/api/settingApi";
import { formatCurrency, formatDate } from "@/utils/functions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type SubscriptionCycleDialogProps = {
  subscription: ApiSubscription | null;
  onOpenChange: (isOpen: boolean) => void;
};

export function SubscriptionCycleDialog({
  subscription,
  onOpenChange,
}: SubscriptionCycleDialogProps) {
  // We use the 'subscription' prop to control the open state
  const isOpen = !!subscription;
  const cycles = subscription?.stripeSubscriptionCycle || [];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-3xl'>
        <DialogHeader className='pr-8'>
          <DialogTitle>Transaction History</DialogTitle>
          <DialogDescription>
            All billing cycles for{" "}
            <span className='font-medium text-primary'>
              {subscription?.planId.title}
            </span>{" "}
            plan.
          </DialogDescription>
          <DialogClose className='absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground'>
            <X className='h-4 w-4' />
            <span className='sr-only'>Close</span>
          </DialogClose>
        </DialogHeader>

        {/* --- Cycle Details Table --- */}
        <div className='max-h-[60vh] overflow-y-auto'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Paid Amount</TableHead>
                <TableHead>Invoice</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cycles.length > 0 ? (
                cycles.map((cycle) => (
                  <TableRow key={cycle.period_start}>
                    <TableCell>
                      <Badge
                        variant={
                          cycle.status === "paid" ? "default" : "secondary"
                        }
                        className='capitalize'
                      >
                        {cycle.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(cycle.period_start)}</TableCell>
                    <TableCell>
                      {/* Assuming 'total' is in cents, like from Stripe */}
                      {formatCurrency(cycle.total, "USD", {
                        amountInSmallestUnit: true,
                      })}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant='outline'
                        size='sm'
                        asChild
                        disabled={!cycle.invoice_pdf}
                      >
                        <a
                          href={cycle.invoice_pdf}
                          target='_blank'
                          rel='noopener noreferrer'
                        >
                          <ExternalLinkIcon className='mr-2 h-4 w-4' />
                          Open
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className='text-center text-muted-foreground'
                  >
                    No transaction cycles found for this subscription.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
