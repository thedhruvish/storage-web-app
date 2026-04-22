import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, XCircle } from "lucide-react";
import axiosClient from "@/api/axios-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const paymentProcessSchema = z.object({
  razorpay_payment_id: z.string().catch(""),
  razorpay_subscription_id: z.string().catch(""),
  razorpay_signature: z.string().catch(""),
  error: z.string().catch(""),
});

export const Route = createFileRoute("/_web/payment-procces")({
  validateSearch: paymentProcessSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const {
    razorpay_payment_id,
    razorpay_subscription_id,
    razorpay_signature,
    error,
  } = Route.useSearch();

  const navigate = Route.useNavigate();
  const hasVerified = useRef(false);
  const [verifying, setVerifying] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const verifyPayment = async () => {
    if (
      !razorpay_payment_id ||
      !razorpay_subscription_id ||
      !razorpay_signature
    ) {
      setErrorMessage("Invalid payment response from Razorpay.");
      setVerifying(false);
      return;
    }

    try {
      await axiosClient.post("/payment/razorpay-verify", {
        razorpay_payment_id,
        razorpay_subscription_id,
        razorpay_signature,
      });

      localStorage.setItem("payment_status", "INIT");

      navigate({ to: "/payment-success" });
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || "Payment verification failed."
      );
      setVerifying(false);
    }
  };

  useEffect(() => {
    // If Razorpay returned error param
    if (error && !hasVerified.current) {
      hasVerified.current = true;
      setErrorMessage(error);
      setVerifying(false);
      return;
    }

    if (
      razorpay_payment_id &&
      razorpay_subscription_id &&
      razorpay_signature &&
      !hasVerified.current
    ) {
      hasVerified.current = true;
      verifyPayment();
    } else if (!hasVerified.current) {
      hasVerified.current = true;
      setErrorMessage("Missing payment parameters.");
      setVerifying(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (verifying) {
    return (
      <div className='flex min-h-[80vh] w-full flex-col items-center justify-center gap-6 px-6 animate-in fade-in duration-500'>
        <div className='relative flex items-center justify-center'>
          <div className='absolute h-16 w-16 animate-ping rounded-full bg-primary/10 duration-1000' />
          <Loader2 className='h-10 w-10 animate-spin text-primary' />
        </div>
        <div className='space-y-2 text-center'>
          <h2 className='text-2xl font-bold tracking-tight text-foreground'>
            Verifying your payment
          </h2>
          <p className='text-muted-foreground text-sm max-w-[280px] mx-auto'>
            This will only take a moment. Please do not refresh or close this
            page.
          </p>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className='flex min-h-[80vh] w-full flex-col items-center justify-center p-6 animate-in fade-in duration-500'>
        <Card className='max-w-md w-full border border-border bg-card shadow-2xl shadow-destructive/5 p-0 overflow-hidden'>
          <CardHeader className='pt-10 pb-6 flex flex-col items-center gap-4 text-center'>
            <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/5 text-destructive'>
              <XCircle className='h-8 w-8' />
            </div>
            <div className='space-y-2'>
              <CardTitle className='text-3xl font-bold tracking-tight text-foreground'>
                Verification failed
              </CardTitle>
              <CardDescription className='text-muted-foreground text-sm'>
                {errorMessage === "cancelled"
                  ? "The payment process was cancelled."
                  : errorMessage}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className='flex flex-col gap-6 px-10 pb-10'>
            <div className='flex flex-col sm:flex-row gap-3'>
              <Button
                variant='outline'
                onClick={() => navigate({ to: "/" })}
                className='flex-1 h-11 rounded-xl font-semibold border-border transition-all hover:bg-muted/50'
              >
                Back to home
              </Button>
              <Button
                onClick={() => navigate({ to: "/pricing" })}
                className='flex-1 h-11 rounded-xl font-semibold bg-primary shadow-md shadow-primary/20 transition-all hover:translate-y-[-1px]'
              >
                View plans
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
