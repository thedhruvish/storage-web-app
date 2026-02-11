import { useState } from "react";
import z from "zod";
import { createFileRoute } from "@tanstack/react-router";
import { loadRazorpay, razorpayOption } from "@/pages/web/home/razorpay-helper";
import { useUser } from "@/store/user-store";
import { DollarSign, IndianRupee } from "lucide-react";
import { toast } from "sonner";
import { useCheckout, useGetAllPlansPublic } from "@/api/checkout-api";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { PricingCard } from "@/components/pricing-card";

const pricingSearchSchema = z.object({
  isYearly: z.boolean().optional().default(false),
  currency: z.enum(["USD", "INR"]).optional().default("INR"),
});
export const Route = createFileRoute("/_web/pricing")({
  validateSearch: pricingSearchSchema,
  component: PricingPage,
});

function PricingPage() {
  const {
    data: plansData,

    error,
    isPending: plansPending,
  } = useGetAllPlansPublic();
  const { isYearly, currency } = Route.useSearch();
  const { user } = useUser();
  const navigate = Route.useNavigate();
  const [razorpayLoading, setRazorpayLoading] = useState(false);

  const { mutate: checkoutMutate, isPending: checkoutPending } = useCheckout();

  const checkoutStripeHandler = (id: string, price: number, plan: any) => {
    if (!user) {
      navigate({ to: "/auth/login" });
      return;
    }
    // Only allow checkout if price is greater than 0
    if (price > 0) {
      checkoutMutate(
        {
          id,
          billing: isYearly ? "yearly" : "monthly",
          provider: currency === "INR" ? "razorpay" : "stripe",
        },
        {
          async onSuccess(data) {
            localStorage.setItem("payment_status", "INIT");
            if (currency === "USD") {
              window.open(data.url, "_blank");
            } else {
              setRazorpayLoading(true);
              const isLoaded = await loadRazorpay();
              if (!isLoaded) {
                toast.error("Razorpay SDK failed to load");
                return;
              }
              const options = razorpayOption(
                data,
                plan.title,
                () => {
                  setRazorpayLoading(false);
                  toast.info("Payment cancelled");
                },
                (response) => {
                  setRazorpayLoading(false);
                  navigate({
                    to: "/payment-procces",
                    search: {
                      razorpay_payment_id: response.razorpay_payment_id,
                      razorpay_subscription_id:
                        response.razorpay_subscription_id,
                      razorpay_signature: response.razorpay_signature,
                    },
                  });
                }
              );
              const rzp = new window.Razorpay(options);
              rzp.open();
              rzp.on("payment.failed", function () {
                toast.error("Payment Failed");
                setRazorpayLoading(false);
              });
            }

            // window.open(data, "_blank");
          },
          onError() {
            toast.error("Error", {
              description: "Failed to create checkout session.",
            });
          },
        }
      );
    }
  };

  const setCurrency = (newCurrency: "USD" | "INR") => {
    navigate({ search: (prev) => ({ ...prev, currency: newCurrency }) });
  };

  const toggleYearly = () => {
    navigate({ search: (prev) => ({ ...prev, isYearly: !isYearly }) });
  };

  if (plansPending) {
    return (
      <div className='flex h-[80vh] items-center justify-center'>
        <Spinner className='size-8' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex h-[80vh] flex-col items-center justify-center gap-4 text-center'>
        <p className='text-destructive text-lg font-medium'>
          Failed to load pricing plans.
        </p>
        <button
          onClick={() => window.location.reload()}
          className='text-primary underline hover:no-underline'
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <main className='pt-40 pb-20'>
      <div className='container mx-auto px-6 max-w-6xl'>
        {/* Header & Toggles */}
        <div className='text-center mb-16'>
          <h1 className='text-4xl md:text-5xl font-bold mb-6'>
            Simple, Transparent Pricing
          </h1>
          <p className='text-xl text-muted-foreground mb-10'>
            Choose the plan that fits your needs. No hidden fees.
          </p>

          {/* Controls Container */}
          <div className='flex flex-col md:flex-row items-center justify-center gap-8 bg-secondary/30 p-2 rounded-xl w-full md:w-auto max-w-2xl mx-auto'>
            {/* Currency Toggle */}
            <div className='flex items-center gap-4 bg-background p-1 rounded-lg border shadow-sm'>
              <button
                onClick={() => setCurrency("USD")}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                  currency === "USD"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <DollarSign className='h-4 w-4' /> USD
              </button>
              <button
                onClick={() => setCurrency("INR")}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                  currency === "INR"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <IndianRupee className='h-4 w-4' /> INR
              </button>
            </div>

            <div className='h-8 w-px bg-border hidden md:block' />

            {/* Billing Cycle Toggle */}
            <div className='flex items-center gap-3'>
              <span
                className={cn(
                  "text-sm font-medium",
                  !isYearly ? "text-foreground" : "text-muted-foreground"
                )}
              >
                Monthly
              </span>
              <button
                onClick={toggleYearly}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isYearly ? "bg-primary" : "bg-input"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-background transition-transform",
                    isYearly ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </button>
              <span
                className={cn(
                  "text-sm font-medium",
                  isYearly ? "text-foreground" : "text-muted-foreground"
                )}
              >
                Yearly{" "}
                <span className='text-green-500 text-xs font-bold ml-1'>
                  -20%
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 justify-center'>
          {/* Map over the plans provided */}
          {plansData?.map((plan: any) => (
            <PricingCard
              key={plan._id}
              plan={plan}
              disabled={checkoutPending || razorpayLoading}
              currency={currency}
              cycle={isYearly ? "yearly" : "monthly"}
              isPopular={plan.title.toLowerCase() !== "basic"}
              onSubscribe={(planId) =>
                checkoutStripeHandler(
                  planId,
                  currency === "USD"
                    ? plan[isYearly ? "yearly" : "monthly"].priceUSD
                    : plan[isYearly ? "yearly" : "monthly"].priceINR,
                  plan
                )
              }
            />
          ))}
        </div>
      </div>
    </main>
  );
}
