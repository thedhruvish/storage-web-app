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
    <div className='min-h-screen w-full flex items-center justify-center bg-muted'>
      <Card className='w-[420px] text-center shadow-xl'>
        <CardHeader>
          <div className='mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100'>
            <XCircle className='h-12 w-12 text-red-600' />
          </div>
          <CardTitle className='pt-4 text-3xl font-bold'>
            Payment Failed
          </CardTitle>
          <CardDescription className='text-base'>
            We couldn't process your payment. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-4'>
          <p className='text-sm text-muted-foreground'>
            If money was deducted, it will be refunded automatically within 5-7
            business days.
          </p>
          <div className='flex gap-4 justify-center'>
            <Link
              to='/pricing'
              className='inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2'
            >
              Try Again
            </Link>
            <Link
              to='/'
              className='inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2'
            >
              Go to Dashboard
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
