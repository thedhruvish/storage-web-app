import { createFileRoute, Link } from "@tanstack/react-router";
import { XCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/_web/payment-fail")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className='min-h-[80vh] w-full flex items-center justify-center p-6'>
      <Card className='max-w-md w-full border border-border bg-card shadow-2xl shadow-destructive/5 p-0 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700'>
        <CardHeader className='pt-10 pb-6 flex flex-col items-center gap-4 text-center'>
          <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/5 text-destructive'>
            <XCircle className='h-8 w-8' />
          </div>
          <div className='space-y-2'>
            <CardTitle className='text-3xl font-bold tracking-tight text-foreground'>
              Payment failed
            </CardTitle>
            <CardDescription className='text-muted-foreground text-sm'>
              We couldn't process your transaction.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className='flex flex-col gap-8 px-10 pb-10'>
          <p className='text-sm text-center text-muted-foreground/80 leading-relaxed'>
            There was an issue with your payment method or authorization. Any
            pending charges will be automatically refunded by your bank.
          </p>
          <div className='flex flex-col sm:flex-row gap-3'>
            <Link
              to='/pricing'
              className='flex-1 inline-flex h-11 items-center justify-center rounded-xl border border-border bg-background px-6 text-sm font-semibold text-foreground transition-all hover:bg-muted/50 active:translate-y-[1px]'
            >
              Try another method
            </Link>
            <Link
              to='/'
              className='flex-1 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:translate-y-[-1px] active:translate-y-0'
            >
              Back to home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
