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
    <div className='min-h-[80vh] w-full flex items-center justify-center p-6'>
      <Card className='max-w-md w-full border border-border bg-card shadow-2xl shadow-primary/5 p-0 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700'>
        <CardHeader className='pt-10 pb-6 flex flex-col items-center gap-4 text-center'>
          <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5 text-primary'>
            <CheckCircle className='h-8 w-8' />
          </div>
          <div className='space-y-2'>
            <CardTitle className='text-3xl font-bold tracking-tight text-foreground'>
              Payment successful
            </CardTitle>
            <CardDescription className='text-muted-foreground text-sm'>
              Your transaction has been processed securely.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className='flex flex-col gap-8 px-10 pb-10'>
          <p className='text-sm text-center text-muted-foreground/80 leading-relaxed'>
            Thank you for your purchase. You now have full access to all premium
            features and expanded storage capacity.
          </p>
          <a
            href='/app'
            className='inline-flex h-11 items-center justify-center rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:translate-y-[-1px] active:translate-y-0'
          >
            Go to dashboard
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
