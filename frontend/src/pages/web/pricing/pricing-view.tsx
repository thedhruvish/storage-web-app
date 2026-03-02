import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { DollarSign, IndianRupee } from "lucide-react";
import { toast } from "sonner";
import { useCheckout, useGetAllPlansPublic } from "@/api/checkout-api";
import { PricingCard } from "@/components/pricing-card";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { loadRazorpay, razorpayOption } from "@/pages/web/home/razorpay-helper";
import { useUser } from "@/store/user-store";

export type PricingViewState = {
  isYearly: boolean;
  currency: "USD" | "INR";
};

type PricingViewProps = {
  mode?: "page" | "modal";
  value?: PricingViewState;
  onValueChange?: (next: Partial<PricingViewState>) => void;
};

export function PricingView({
  mode = "page",
  value,
  onValueChange,
}: PricingViewProps) {
  const {
    data: plansData,
    error,
    isPending: plansPending,
  } = useGetAllPlansPublic();
  const { user } = useUser();
  const navigate = useNavigate();
  const [razorpayLoading, setRazorpayLoading] = useState(false);
  const [localIsYearly, setLocalIsYearly] = useState(false);
  const [localCurrency, setLocalCurrency] = useState<"USD" | "INR">("INR");

  const isYearly = value?.isYearly ?? localIsYearly;
  const currency = value?.currency ?? localCurrency;

  const { mutate: checkoutMutate, isPending: checkoutPending } = useCheckout();

  const setCurrency = (newCurrency: "USD" | "INR") => {
    if (onValueChange) {
      onValueChange({ currency: newCurrency });
      return;
    }
    setLocalCurrency(newCurrency);
  };

  const toggleYearly = () => {
    if (onValueChange) {
      onValueChange({ isYearly: !isYearly });
      return;
    }
    setLocalIsYearly((prev) => !prev);
  };

  const checkoutStripeHandler = (id: string, price: number, plan: any) => {
    if (!user) {
      navigate({ to: "/auth/login" });
      return;
    }

    if (price <= 0) {
      return;
    }

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
            return;
          }

          setRazorpayLoading(true);
          const isLoaded = await loadRazorpay();
          if (!isLoaded) {
            toast.error("Razorpay SDK failed to load");
            setRazorpayLoading(false);
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
                  razorpay_subscription_id: response.razorpay_subscription_id,
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
        },
        onError() {
          toast.error("Error", {
            description: "Failed to create checkout session.",
          });
        },
      }
    );
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
    <main className={mode === "modal" ? "pt-8 pb-12" : "pt-40 pb-20"}>
      <div className='container mx-auto max-w-6xl px-6'>
        <div className='mb-16 text-center'>
          <h1 className='mb-6 text-4xl font-bold md:text-5xl'>
            Simple, Transparent Pricing
          </h1>
          <p className='mb-10 text-xl text-muted-foreground'>
            Choose the plan that fits your needs. No hidden fees.
          </p>

          <div className='bg-secondary/30 mx-auto flex w-full max-w-2xl flex-col items-center justify-center gap-8 rounded-xl p-2 md:w-auto md:flex-row'>
            <div className='bg-background flex items-center gap-4 rounded-lg border p-1 shadow-sm'>
              <button
                onClick={() => setCurrency("USD")}
                className={cn(
                  "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all",
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
                  "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all",
                  currency === "INR"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <IndianRupee className='h-4 w-4' /> INR
              </button>
            </div>

            <div className='bg-border hidden h-8 w-px md:block' />

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
                  "focus-visible:ring-ring focus-visible:ring-offset-background relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                  isYearly ? "bg-primary" : "bg-input"
                )}
              >
                <span
                  className={cn(
                    "bg-background inline-block h-4 w-4 transform rounded-full transition-transform",
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
                <span className='ml-1 text-xs font-bold text-green-500'>-20%</span>
              </span>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 justify-center gap-8 md:grid-cols-3'>
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
