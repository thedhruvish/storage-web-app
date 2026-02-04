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

export const Route = createFileRoute("/_web/payment-success")({
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
    if (localStorage.getItem("payment_status") === "INIT") {
      fireConfetti();

      localStorage.setItem("payment_status", "SUCCESS");

      localStorage.removeItem("payment_status");
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
            Your payment has been processed successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-4'>
          <p className='text-sm text-muted-foreground'>
            You now have access to premium features.
          </p>
          <a
            href='/'
            className='inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2'
          >
            Go to Dashboard
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
