import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";
import {
  PricingCard,
  type BillingCycle,
  type Currency,
} from "@/pages/other/PricingCard";
import { useGetAllPlansPublic } from "@/api/checkoutApi";
import { useCheckoutStripe } from "@/api/checkoutApi";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const pricingSearchSchema = z.object({
  billing: z.enum(["month", "year"]).optional().default("month"),
  currency: z.enum(["inr", "usd"]).optional().default("inr"),
});

export const Route = createFileRoute("/_website/pricing")({
  validateSearch: (search) => pricingSearchSchema.parse(search),
  component: PricingPage,
});

export default function PricingPage() {
  const { data, isLoading } = useGetAllPlansPublic();
  const { billing, currency } = Route.useSearch();

  const navigate = Route.useNavigate();

  const { mutate: checkoutStripeMutate, isPending } = useCheckoutStripe();

  const filteredPlans = data?.filter((plan) => plan.interval === billing) ?? [];
  const checkoutStripeHandler = (id: string) => {
    if (currency === "usd") {
      checkoutStripeMutate(id, {
        onSuccess(data) {
          localStorage.setItem("payment_status", "INIT");
          window.open(data, "_blank");
        },
      });
    }
  };

  return (
    <div className='container mx-auto max-w-7xl px-4 py-12'>
      {/* Header */}
      <div className='text-center mb-12'>
        <h1 className='text-4xl font-extrabold tracking-tight lg:text-5xl'>
          Our Pricing Plans
        </h1>
        <p className='mt-4 text-xl text-muted-foreground'>
          Choose the plan that's right for you.
        </p>
      </div>

      {/* Controls */}
      <div className='flex flex-col sm:flex-row justify-center items-center gap-4 mb-10'>
        <Select
          value={currency}
          onValueChange={(value) =>
            navigate({
              search: (prev) => ({ ...prev, currency: value as Currency }),
              replace: true,
            })
          }
        >
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Select Currency' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='inr'>Currency: INR (₹)</SelectItem>
            <SelectItem value='usd'>Currency: USD ($)</SelectItem>
          </SelectContent>
        </Select>

        <Tabs
          value={billing}
          onValueChange={(value) =>
            navigate({
              search: (prev) => ({ ...prev, billing: value as BillingCycle }),
              replace: true,
            })
          }
          className='w-auto'
        >
          <TabsList>
            <TabsTrigger value='month'>Monthly</TabsTrigger>
            <TabsTrigger value='year'>Yearly (Save 16%)</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Pricing Grid */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {isLoading &&
          // Show skeleton loaders while data is fetching
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className='flex flex-col'>
              <CardHeader>
                <Skeleton className='h-6 w-1/2' />
                <Skeleton className='h-4 w-3/4' />
              </CardHeader>
              <CardContent className='flex-grow space-y-4'>
                <Skeleton className='h-10 w-1/3' />
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-full' />
              </CardContent>
              <CardFooter>
                <Skeleton className='h-10 w-full' />
              </CardFooter>
            </Card>
          ))}

        {!isLoading && filteredPlans.length === 0 && (
          <p className='text-muted-foreground text-center md:col-span-3'>
            No plans available for this billing cycle.
          </p>
        )}

        {!isLoading &&
          filteredPlans.map((plan) => (
            <PricingCard
              key={plan._id} // Use the database ID as the key
              plan={plan}
              currency={currency}
              isPending={isPending}
              checkoutHandler={checkoutStripeHandler}
            />
          ))}
      </div>
    </div>
  );
}
