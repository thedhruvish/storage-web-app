import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle, CalendarDays, Database, Loader2 } from "lucide-react";
import { useGetAllSubscriptions, type ApiSubscription } from "@/api/settingApi";
import { formatCurrency, formatDate, formatFileSize } from "@/utils/functions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/setting/billing")({
  component: BillingSettingsPage,
});

const getStatusVariant = (
  status: ApiSubscription["status"]
): "default" | "destructive" | "secondary" | "outline" => {
  switch (status) {
    case "active":
      return "default"; // Green (if customized) or primary
    case "cancelled":
      return "destructive"; // Red
    case "paused":
      return "secondary"; // Gray
    case "expired":
      return "outline"; // Lighter gray
    default:
      return "secondary";
  }
};

export function BillingSettingsPage() {
  // Use the hook to fetch data
  const { data: subscriptions, isLoading, isError } = useGetAllSubscriptions();

  // Find the current active subscription
  // We use optional chaining (?) in case 'subscriptions' is not yet loaded
  const currentSubscription = subscriptions?.find(
    (sub) => sub.status === "active"
  );

  // 1. Loading State
  if (isLoading) {
    return (
      <div className='flex min-h-[400px] w-full items-center justify-center p-8'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    );
  }

  // 2. Error State
  if (isError) {
    return (
      <Card className='border-destructive'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <AlertCircle className='h-5 w-5 text-destructive' />
            Error Loading Subscriptions
          </CardTitle>
          <CardDescription>
            There was a problem fetching your billing details. Please try again
            later.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // 3. Success/Data State
  return (
    <div className='space-y-8 p-4 md:p-8'>
      <h1 className='text-2xl font-bold'>Billing & Subscriptions</h1>

      {/* --- Section 1: Current Plan --- */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            Manage your active subscription and payment details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentSubscription ? (
            // We define the price/currency variables right after
            // confirming we have a 'currentSubscription'.
            (() => {
              const isStripe = currentSubscription.paymentType === "stripe";
              const price = isStripe
                ? currentSubscription.planId.priceUSD
                : currentSubscription.planId.priceINR;
              const currency = isStripe ? "USD" : "INR";

              return (
                <div className='flex flex-col space-y-4 md:flex-row md:items-start md:justify-between md:space-y-0'>
                  {/* --- Left Side: Plan Details --- */}
                  <div className='flex-1'>
                    <h3 className='text-lg font-semibold'>
                      {currentSubscription.planId.title}{" "}
                      <span className='text-base font-normal capitalize text-muted-foreground'>
                        ({currentSubscription.planId.interval})
                      </span>
                    </h3>

                    {/* --- Cleaner Price Display --- */}
                    <p className='text-muted-foreground'>
                      {formatCurrency(price, currency, {
                        amountInSmallestUnit: false,
                      })}{" "}
                      / {currentSubscription.planId.interval}
                    </p>

                    {/* --- Plan Features List --- */}
                    <div className='mt-4 space-y-2'>
                      <div className='flex items-center text-sm'>
                        <Database className='mr-2 h-4 w-4 text-muted-foreground' />
                        <span className='text-muted-foreground'>Storage:</span>
                        <strong className='ml-1.5'>
                          {formatFileSize(
                            currentSubscription.planId.totalBytes
                          )}
                        </strong>
                      </div>
                      <div className='flex items-center text-sm'>
                        <CalendarDays className='mr-2 h-4 w-4 text-muted-foreground' />
                        <span className='text-muted-foreground'>
                          Renews on:
                        </span>
                        <strong className='ml-1.5'>
                          {formatDate(currentSubscription.endDate)}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* --- Right Side: Status Badge --- */}
                  <div className='flex-shrink-0'>
                    <Badge
                      variant={getStatusVariant(currentSubscription.status)}
                      className='capitalize'
                    >
                      {currentSubscription.status}
                    </Badge>
                  </div>
                </div>
              );
            })()
          ) : (
            <p>You do not have an active subscription.</p>
          )}
        </CardContent>
        {currentSubscription && (
          <CardFooter className='flex flex-col items-start gap-4 border-t pt-6 md:flex-row md:justify-between'>
            <Button variant='outline' onClick={() => console.log("ok")}>
              Manage Subscription
            </Button>
            {currentSubscription.status === "active" && (
              <Button variant='destructive'>Cancel Subscription</Button>
            )}
          </CardFooter>
        )}
      </Card>

      {/* --- Section 2: Billing History --- */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            View all your previous subscription details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Price </TableHead>
                <TableHead>Subscription ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions && subscriptions.length > 0 ? (
                subscriptions.map((sub) => (
                  <TableRow key={sub._id}>
                    <TableCell className='font-medium'>
                      {sub.planId.title}{" "}
                      <span className='capitalize text-muted-foreground'>
                        ({sub.planId.interval})
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusVariant(sub.status)}
                        className='capitalize'
                      >
                        {sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDate(sub.startDate)} - {formatDate(sub.endDate)}
                    </TableCell>
                    <TableCell className='capitalize'>
                      {sub.paymentType}
                    </TableCell>
                    <TableCell className='font-mono text-xs'>
                      ${sub.planId.priceUSD}
                    </TableCell>
                    <TableCell className='font-mono text-xs'>
                      {sub.subscriptionId}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className='text-center text-muted-foreground'
                  >
                    No billing history found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
