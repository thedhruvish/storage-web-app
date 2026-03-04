import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import axiosClient from "@/api/axios-client";
import { Button } from "@/components/ui/button";

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
      <div className='flex h-screen w-full flex-col items-center justify-center gap-4'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
        <h2 className='text-xl font-semibold text-foreground'>
          Verifying your payment...
        </h2>
        <p className='text-muted-foreground'>
          Please do not close this window or press back.
        </p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className='flex h-screen w-full flex-col items-center justify-center gap-4'>
        <h2 className='text-xl font-semibold text-destructive'>
          Payment Failed
        </h2>
        <p className='text-muted-foreground'>
          {errorMessage == "cancelled"
            ? "Your are the cancel Payment"
            : errorMessage}
        </p>
        <div className='flex gap-6'>
          <Button
            variant={"outline"}
            onClick={() => navigate({ to: "/" })}
            className='mt-4 rounded-md  px-4 py-2 '
          >
            Go to Home
          </Button>
          <Button
            onClick={() => navigate({ to: "/pricing" })}
            className='mt-4 rounded-md  px-4 py-2 '
          >
            Price
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
