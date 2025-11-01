import { Check } from "lucide-react";
import { formatFileSize } from "@/utils/functions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// This type matches the data structure coming from your backend
export type Currency = "inr" | "usd";
export type BillingCycle = "month" | "year";

export type BackendPlan = {
  _id: string;
  title: string;
  description: string;
  priceINR: number;
  priceUSD: number;
  interval: "month" | "year";
  totalBytes: number;
  isFeatured?: boolean;
  features?: string[];
};

const formatCurrency = (amount: number, currency: Currency) => {
  if (amount === -1) return "Custom";

  return new Intl.NumberFormat(currency === "inr" ? "en-IN" : "en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

interface PricingCardProps {
  plan: BackendPlan;
  isPending: boolean;
  currency: Currency;
  checkoutHandler: (plan: string) => void;
}

export function PricingCard({
  plan,
  currency,
  isPending,
  checkoutHandler,
}: PricingCardProps) {
  const price = currency === "inr" ? plan.priceINR : plan.priceUSD;
  const isFree = price === 0;

  return (
    <Card
      className={`flex flex-col ${
        plan.isFeatured ? "border-primary shadow-lg" : ""
      }`}
    >
      <CardHeader className='relative'>
        {plan.isFeatured && (
          <Badge className='absolute top-[-10px] right-6'>Most Popular</Badge>
        )}
        <CardTitle>{plan.title}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      <CardContent className='flex-grow'>
        <div className='mb-6'>
          <span className='text-4xl font-bold'>
            {isFree ? "Free" : formatCurrency(price, currency)}
          </span>
          <span className='text-muted-foreground'>
            {isFree || price === -1 ? "" : `/${plan.interval}`}
          </span>
        </div>
        <ul className='space-y-2'>
          <li className='flex items-center'>
            <Check className='mr-2 h-4 w-4 text-primary' />
            {formatFileSize(plan.totalBytes)} Storage
          </li>
          {/* NOTE: 'features' is not in your backend schema.
              If you add `features: [String]` to your Mongoose schema,
              you can uncomment this section to display them.
            */}
          {/* {plan.features?.map((feature) => (
              <li key={feature} className='flex items-center'>
                <Check className='mr-2 h-4 w-4 text-primary' />
                {feature}
              </li>
            ))} */}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          className='w-full'
          variant={plan.isFeatured ? "default" : "outline"}
          onClick={() => checkoutHandler(plan._id)}
          disabled={isPending}
        >
          {price === -1 ? "Contact Sales" : "Get Started"}
        </Button>
      </CardFooter>
    </Card>
  );
}
