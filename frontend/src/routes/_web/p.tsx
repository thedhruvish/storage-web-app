import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CheckCircle2, DollarSign, IndianRupee } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_web/p")({
  component: PricingPage,
});

const pricingData = {
  USD: {
    basic: 0,
    pro: { monthly: 9.99, yearly: 89.99 },
    team: { monthly: 19.99, yearly: 199.99 },
  },
  INR: {
    basic: 0,
    pro: { monthly: 799, yearly: 7999 },
    team: { monthly: 1599, yearly: 15999 },
  },
};

function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const [currency, setCurrency] = useState<"USD" | "INR">("USD");

  const currentPrices = pricingData[currency];
  const cycle = isYearly ? "yearly" : "monthly";

  // Helper to get formatted price
  const getPrice = (tier: "basic" | "pro" | "team") => {
    if (tier === "basic") return currency === "USD" ? "$0" : "₹0";
    const price = currentPrices[tier][cycle];
    return currency === "USD" ? `$${price}` : `₹${price}`;
  };

  return (
    <main className='pt-40 pb-20'>
      <div className='container mx-auto px-6 max-w-6xl'>
        {/* Header & Toggles */}
        <div className='text-center mb-16'>
          <h1 className='text-4xl md:text-5xl font-bold mb-6'>
            Simple, Transparent Pricing
          </h1>
          <p className='text-xl text-muted-foreground mb-10'>
            Choose the plan that fits your needs. No hidden fees.
          </p>

          {/* Controls Container */}
          <div className='flex flex-col md:flex-row items-center justify-center gap-8 bg-secondary/30 p-2 rounded-xl w-full md:w-auto max-w-2xl mx-auto'>
            {/* Currency Toggle */}
            <div className='flex items-center gap-4 bg-background p-1 rounded-lg border shadow-sm'>
              <button
                onClick={() => setCurrency("USD")}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                  currency === "USD"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <DollarSign className='h-4 w-4' /> USD
              </button>
              <button
                onClick={() => setCurrency("INR")}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                  currency === "INR"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <IndianRupee className='h-4 w-4' /> INR
              </button>
            </div>

            <div className='h-8 w-px bg-border hidden md:block' />

            {/* Billing Cycle Toggle */}
            <div className='flex items-center gap-3'>
              <span
                className={cn(
                  "text-sm font-medium",
                  !isYearly ? "text-foreground" : "text-muted-foreground"
                )}
              >
                Monthly
              </span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isYearly ? "bg-primary" : "bg-input"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-background transition-transform",
                    isYearly ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </button>
              <span
                className={cn(
                  "text-sm font-medium",
                  isYearly ? "text-foreground" : "text-muted-foreground"
                )}
              >
                Yearly{" "}
                <span className='text-green-500 text-xs font-bold ml-1'>
                  -20%
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {/* Basic */}
          <motion.div
            whileHover={{ y: -5 }}
            className='p-8 rounded-2xl border bg-card flex flex-col h-full'
          >
            <h3 className='text-xl font-bold mb-2'>Community</h3>
            <div className='text-4xl font-bold mb-6'>{getPrice("basic")}</div>
            <p className='text-muted-foreground mb-8'>
              For individuals and open source enthusiasts.
            </p>
            <ul className='space-y-4 mb-8 flex-1 text-sm'>
              <li className='flex gap-3'>
                <CheckCircle2 className='h-5 w-5 text-green-500 shrink-0' /> 5GB
                Local Storage
              </li>
              <li className='flex gap-3'>
                <CheckCircle2 className='h-5 w-5 text-green-500 shrink-0' />{" "}
                Connect 1 Cloud (S3/Drive)
              </li>
              <li className='flex gap-3'>
                <CheckCircle2 className='h-5 w-5 text-green-500 shrink-0' />{" "}
                Basic File Organization
              </li>
              <li className='flex gap-3'>
                <CheckCircle2 className='h-5 w-5 text-green-500 shrink-0' />{" "}
                Community Support
              </li>
            </ul>
            <button className='w-full py-3 rounded-lg border font-medium hover:bg-secondary transition-colors'>
              Download Free
            </button>
          </motion.div>

          {/* Pro */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className='relative p-8 rounded-2xl border-2 border-primary bg-card flex flex-col h-full shadow-xl'
          >
            <div className='absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide'>
              Most Popular
            </div>
            <h3 className='text-xl font-bold mb-2 text-primary'>Pro</h3>
            <div className='text-5xl font-extrabold mb-2'>
              {getPrice("pro")}
            </div>
            <p className='text-muted-foreground mb-8 text-sm'>
              per {isYearly ? "year" : "month"}
            </p>
            <ul className='space-y-4 mb-8 flex-1 text-sm'>
              <li className='flex gap-3'>
                <CheckCircle2 className='h-5 w-5 text-primary shrink-0' /> 1TB
                Cloud Storage
              </li>
              <li className='flex gap-3'>
                <CheckCircle2 className='h-5 w-5 text-primary shrink-0' />{" "}
                Unlimited Connections
              </li>
              <li className='flex gap-3'>
                <CheckCircle2 className='h-5 w-5 text-primary shrink-0' /> AI
                Smart Cleaning
              </li>
              <li className='flex gap-3'>
                <CheckCircle2 className='h-5 w-5 text-primary shrink-0' />{" "}
                Priority Email Support
              </li>
              <li className='flex gap-3'>
                <CheckCircle2 className='h-5 w-5 text-primary shrink-0' />{" "}
                Advanced Sharing Controls
              </li>
            </ul>
            <button className='w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25'>
              Get Started
            </button>
          </motion.div>

          {/* Team */}
          <motion.div
            whileHover={{ y: -5 }}
            className='p-8 rounded-2xl border bg-card flex flex-col h-full'
          >
            <h3 className='text-xl font-bold mb-2'>Team</h3>
            <div className='text-4xl font-bold mb-6'>{getPrice("team")}</div>
            <p className='text-muted-foreground mb-8'>
              For startups and growing teams.
            </p>
            <ul className='space-y-4 mb-8 flex-1 text-sm'>
              <li className='flex gap-3'>
                <CheckCircle2 className='h-5 w-5 text-green-500 shrink-0' />{" "}
                Everything in Pro
              </li>
              <li className='flex gap-3'>
                <CheckCircle2 className='h-5 w-5 text-green-500 shrink-0' />{" "}
                Centralized Admin Dashboard
              </li>
              <li className='flex gap-3'>
                <CheckCircle2 className='h-5 w-5 text-green-500 shrink-0' /> SSO
                / SAML Integration
              </li>
              <li className='flex gap-3'>
                <CheckCircle2 className='h-5 w-5 text-green-500 shrink-0' />{" "}
                24/7 Dedicated Support
              </li>
            </ul>
            <button className='w-full py-3 rounded-lg border font-medium hover:bg-secondary transition-colors'>
              Contact Sales
            </button>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
