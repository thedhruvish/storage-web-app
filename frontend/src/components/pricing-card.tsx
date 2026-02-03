import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlanDetails {
  priceINR: number;
  priceUSD: number;
  stripeId: string;
  razorpayId: string;
}

export interface Plan {
  _id: string;
  title: string;
  monthly: PlanDetails;
  yearly: PlanDetails;
  fetures: string[]; // Keeping 'fetures' as per provided data structure, though 'features' is correct spelling
  totalBytes?: number;
}

interface PricingCardProps {
  plan: Plan;
  currency: "USD" | "INR";
  cycle: "monthly" | "yearly";
  isPopular?: boolean;
  onSubscribe: (id: string) => void;
}

export function PricingCard({
  plan,
  currency,
  cycle,
  isPopular,
  onSubscribe,
}: PricingCardProps) {
  const isYearly = cycle === "yearly";

  // Calculate price to display
  const price =
    currency === "USD" ? plan[cycle].priceUSD : plan[cycle].priceINR;

  const currencySymbol = currency === "USD" ? "$" : "₹";
  const id = plan._id;

  return (
    <motion.div
      whileHover={isPopular ? { scale: 1.02 } : { y: -5 }}
      className={cn(
        "p-8 rounded-2xl border bg-card flex flex-col h-full",
        isPopular ? "relative border-2 border-primary shadow-xl" : ""
      )}
    >
      {isPopular && (
        <div className='absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide'>
          Most Popular
        </div>
      )}

      <h3
        className={cn(
          "text-xl font-bold mb-2",
          isPopular ? "text-primary" : ""
        )}
      >
        {plan.title.charAt(0).toUpperCase() + plan.title.slice(1)}
      </h3>

      <div
        className={cn(
          "font-bold mb-6",
          isPopular ? "text-5xl font-extrabold" : "text-4xl"
        )}
      >
        {currencySymbol}
        {price}
        {isPopular && (
          <span className='text-muted-foreground text-sm font-normal ml-1'>
            /{isYearly ? "year" : "month"}
          </span>
        )}
      </div>

      <p className='text-muted-foreground mb-8 text-sm'>
        {/* Placeholder description based on plan title */}
        {plan.title.toLowerCase().includes("basic")
          ? "For individuals just getting started."
          : "Perfect for power users and teams."}
      </p>

      <ul className='space-y-4 mb-8 flex-1 text-sm'>
        {plan?.fetures?.map((feature, i) => (
          <li key={i} className='flex gap-3'>
            <CheckCircle2
              className={cn(
                "h-5 w-5 shrink-0",
                isPopular ? "text-primary" : "text-green-500"
              )}
            />
            {feature}
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSubscribe(id)}
        className={cn(
          "w-full py-3 rounded-lg font-medium transition-colors",
          isPopular
            ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
            : "border hover:bg-secondary"
        )}
      >
        {price === 0 ? "Get Started Free" : "Subscribe Now"}
      </button>
    </motion.div>
  );
}
