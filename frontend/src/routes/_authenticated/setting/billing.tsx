import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SubscriptionCycleDialog } from "@/pages/website/SubscriptionCycleDialog";
import {
  AlertCircle,
  CalendarDays,
  Database,
  Loader2,
  Package,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetAllSubscriptions,
  useToggleSubscriptionPaused,
  useUpdatePaymentDetails,
  type ApiSubscription,
} from "@/api/settingApi";
import { formatCurrency, formatDate, formatFileSize } from "@/utils/functions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
    case "failed":
      return "destructive"; // Red
    case "paused":
      return "secondary"; // Gray
    case "past_due":
      return "secondary";
    case "expired":
      return "outline"; // Lighter gray
    default:
      return "secondary";
  }
};

export function BillingSettingsPage() {
  const [selectedSub, setSelectedSub] = useState<ApiSubscription | null>(null);
  // Use the hook to fetch data
  const { data: subscriptions, isLoading, isError } = useGetAllSubscriptions();
  const { mutate: toggleSubscriptionMutation, isPending: isTogglingPaused } =
    useToggleSubscriptionPaused();
  const {
    mutate: updatePaymentDetailsMutation,
    isPending: isPendingUpdatePaymentDetails,
  } = useUpdatePaymentDetails();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      // Check if the message is the one we expect
      if (event.key === "payment_status" && event.newValue === "SUCCESS") {
        // Payment was successful!
        toast.success("Payment successful! Refreshing data.");

        // 1. Refetch any data that needs updating
        // (e.g., the user's new plan)
        // queryClient.invalidateQueries({ queryKey: ["user-status"] });

        // 2. Clean up the message
        localStorage.removeItem("payment_status");
      }
    };

    // Add the listener
    window.addEventListener("storage", handleStorageChange);

    // Clean up the listener when the component unmounts
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [queryClient]);
  const updatePaymentDetails = () => {
    updatePaymentDetailsMutation(undefined, {
      onSuccess: (data) => {
        window.open(data.url, "_blank");
      },
    });
  };
  const today = new Date();

  let currentSubscription = subscriptions?.find((sub) => {
    const start = new Date(sub.startDate);
    const end = new Date(sub.endDate);
    const isWithinDateRange = today >= start && today <= end;
    const isActiveStatus = sub.status === "active" || sub.status === "past_due";
    return isActiveStatus && isWithinDateRange;
  });

  if (!currentSubscription && subscriptions && subscriptions.length > 0) {
    const sortedSubs = [...subscriptions].sort(
      (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
    );

    currentSubscription = sortedSubs.find((sub) =>
      ["failed", "past_due", "paused", "cancelled"].includes(sub.status)
    );

    if (!currentSubscription) {
      currentSubscription = sortedSubs[0];
    }
  }
  if (isLoading) {
    return (
      <div className='flex min-h-[400px] w-full items-center justify-center p-8'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    );
  }

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

  return (
    <div className='space-y-8 p-4 md:p-8'>
      <h1 className='text-2xl font-bold'>Billing & Subscriptions</h1>

      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            Manage your active subscription and payment details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentSubscription ? (
            (() => {
              const isStripe = currentSubscription.paymentType === "stripe";
              const price = isStripe
                ? currentSubscription.planId.priceUSD
                : currentSubscription.planId.priceINR;
              const currency = isStripe ? "USD" : "INR";

              const isFailed =
                currentSubscription.status === "failed" ||
                currentSubscription.status === "past_due";

              const isActive = currentSubscription.status === "active";

              return (
                <>
                  {isFailed && (
                    <Alert
                      variant='destructive'
                      className='mb-6 flex items-center justify-between'
                    >
                      <div className='flex items-start'>
                        <AlertTriangle className='h-4 w-4 flex-shrink-0' />
                        <div className='ml-3'>
                          <AlertTitle>Payment Failed</AlertTitle>
                          <AlertDescription>
                            Your last payment for this plan failed. Please
                            update your payment method to restore access.
                          </AlertDescription>
                        </div>
                      </div>

                      <Button
                        variant={"destructive"}
                        className='ml-6 flex-shrink-0'
                        onClick={() => {
                          const len =
                            currentSubscription.stripeSubscriptionCycle.length;
                          if (len > 0) {
                            const latestCycle =
                              currentSubscription.stripeSubscriptionCycle[
                                len - 1
                              ];
                            window.open(latestCycle.invoice_pdf);
                          } else {
                            toast.error("Could not find payment link.");
                          }
                        }}
                      >
                        Retry Payment
                      </Button>
                    </Alert>
                  )}

                  <div className='flex flex-col space-y-4 md:flex-row md:items-start md:justify-between md:space-y-0'>
                    <div className='flex-1 space-y-1.5'>
                      <div className='flex items-center gap-3'>
                        <h3 className='text-lg font-semibold'>
                          {currentSubscription.planId.title}
                        </h3>
                        <Badge
                          variant={getStatusVariant(currentSubscription.status)}
                          className='capitalize'
                        >
                          {currentSubscription.status}
                        </Badge>
                      </div>

                      <p className='text-lg text-muted-foreground'>
                        {formatCurrency(price, currency, {
                          amountInSmallestUnit: false,
                        })}{" "}
                        / {currentSubscription.planId.interval}
                      </p>

                      <div className='space-y-2 pt-4'>
                        <div className='flex items-center text-sm'>
                          <Database className='mr-2 h-4 w-4 text-muted-foreground' />
                          <span className='text-muted-foreground'>
                            Storage:
                          </span>
                          <strong className='ml-1.5'>
                            {formatFileSize(
                              currentSubscription.planId.totalBytes
                            )}
                          </strong>
                        </div>
                        <div className='flex items-center text-sm'>
                          <CalendarDays className='mr-2 h-4 w-4 text-muted-foreground' />
                          <span className='text-muted-foreground'>
                            {isActive ? "Renews on:" : "Period End:"}
                          </span>
                          <strong className='ml-1.5'>
                            {formatDate(currentSubscription.endDate)}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()
          ) : (
            <div className='flex min-h-[150px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center'>
              <Package className='h-10 w-10 text-muted-foreground' />
              <p className='mt-4 font-medium'>No Subscription Found</p>
              <p className='text-sm text-muted-foreground'>
                You do not have an active or previous subscription.
              </p>
              <Button asChild className='mt-4'>
                <Link
                  to='/pricing'
                  search={{
                    billing: "month",
                    currency: "usd",
                  }}
                >
                  View Plans
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
        {currentSubscription && (
          <CardFooter className='flex flex-col items-start gap-4 border-t pt-6 md:flex-row md:justify-between'>
            <Button
              variant='outline'
              onClick={updatePaymentDetails}
              disabled={isPendingUpdatePaymentDetails}
            >
              Manage Subscription
            </Button>
            <Button
              variant={
                currentSubscription.isPauseCollection
                  ? "outline"
                  : "destructive"
              }
              onClick={() =>
                toggleSubscriptionMutation(currentSubscription._id, {
                  onSuccess: () => {
                    toast.success("Subscription toggled successfully");
                    currentSubscription.isPauseCollection =
                      !currentSubscription.isPauseCollection;
                    currentSubscription.status =
                      currentSubscription.isPauseCollection
                        ? "paused"
                        : "active";
                  },
                })
              }
              disabled={isTogglingPaused}
            >
              {currentSubscription.isPauseCollection
                ? "Active Payment"
                : "Paused Payment"}
            </Button>
            {/* {currentSubscription.status === "active" && (
              <Button variant='destructive'>Cancel Subscription</Button>
            )} */}
          </CardFooter>
        )}
      </Card>

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
                subscriptions.map((sub) => {
                  const hasCycleData =
                    sub.paymentType === "stripe" &&
                    sub.stripeSubscriptionCycle?.length > 0;

                  return (
                    <TableRow
                      key={sub._id}
                      onClick={() => hasCycleData && setSelectedSub(sub)}
                      className={hasCycleData ? "cursor-pointer" : ""}
                    >
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
                      <TableCell>
                        {formatCurrency(
                          sub.paymentType === "stripe"
                            ? sub.planId.priceUSD
                            : sub.planId.priceINR,
                          sub.paymentType === "stripe" ? "USD" : "INR",
                          { amountInSmallestUnit: false }
                        )}
                      </TableCell>
                      <TableCell className='font-mono text-xs'>
                        {sub.paymentType === "stripe"
                          ? sub.stripeSubscriptionId
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
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
      <SubscriptionCycleDialog
        subscription={selectedSub}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedSub(null);
          }
        }}
      />
    </div>
  );
}
