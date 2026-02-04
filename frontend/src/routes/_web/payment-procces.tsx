import { useEffect, useState } from "react";
import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import axiosClient from "@/api/axios-client";

const paymentProcessSchema = z.object({
  razorpay_payment_id: z.string(),
  razorpay_subscription_id: z.string(),
  razorpay_signature: z.string(),
});

export const Route = createFileRoute("/_web/payment-procces")({
  validateSearch: paymentProcessSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } =
    Route.useSearch();
  const navigate = Route.useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        await axiosClient.post("/payment/razorpay-verify", {
          razorpay_payment_id,
          razorpay_subscription_id,
          razorpay_signature,
        });

        localStorage.setItem("payment_status", "INIT");

        navigate({ to: "/payment-success" });
      } catch (error) {
        console.error("Payment verification failed:", error);
        navigate({ to: "/payment-fail" });
      } finally {
        setIsVerifying(false);
      }
    };

    if (razorpay_payment_id && razorpay_subscription_id && razorpay_signature) {
      verifyPayment();
    } else {
      // If params missing, consider it a failure or invalid access
      navigate({ to: "/payment-fail" });
    }
  }, [
    razorpay_payment_id,
    razorpay_subscription_id,
    razorpay_signature,
    navigate,
  ]);

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
