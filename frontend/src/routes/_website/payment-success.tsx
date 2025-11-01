import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import confetti from "canvas-confetti";
import { CheckCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/_website/payment-success")({
  component: RouteComponent,
});

/**
 * Fires a celebratory confetti burst
 */
function fireConfetti() {
  const duration = 4 * 1000;
  const end = Date.now() + duration;

  (function frame() {
    // Left side burst
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
    });
    // Right side burst
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

function RouteComponent() {
  useEffect(() => {
    // 1. Check if the payment flow was initiated
    if (localStorage.getItem("payment_status") === "INIT") {
      // Fire confetti!
      fireConfetti();

      // 2. Send the "SUCCESS" message to the original tab
      localStorage.setItem("payment_status", "SUCCESS");

      // 3. Attempt to close this tab after a short delay
      //    (to let the user see the message and confetti)
      setTimeout(() => {
        window.close();
      }, 3000); // 2.5-second delay
    }
  }, []);

  return (
    <div className='min-h-screen w-full flex items-center justify-center bg-muted'>
      <Card className='w-[420px] text-center shadow-xl'>
        <CardHeader>
          <div className='mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100'>
            <CheckCircle className='h-12 w-12 text-green-600' />
          </div>
          <CardTitle className='pt-4 text-3xl font-bold'>
            Payment Successful!
          </CardTitle>
          <CardDescription className='text-base'>
            Your payment has been processed. This tab will close automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-muted-foreground'>
            If this tab does not close, you can safely close it yourself.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
