import z from "zod";
import { createFileRoute } from "@tanstack/react-router";
import { PricingView } from "@/pages/web/pricing/pricing-view";

const pricingSearchSchema = z.object({
  isYearly: z.boolean().optional().default(false),
  currency: z.enum(["USD", "INR"]).optional().default("INR"),
});
export const Route = createFileRoute("/_web/pricing")({
  validateSearch: pricingSearchSchema,
  head: () => ({
    links: [
      {
        rel: "canonical",
        href: `${import.meta.env.VITE_BASE_URL}/pricing`,
      },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  const { isYearly, currency } = Route.useSearch();
  const navigate = Route.useNavigate();
  return (
    <PricingView
      mode='page'
      value={{ isYearly, currency }}
      onValueChange={(next) =>
        navigate({ search: (prev) => ({ ...prev, ...next }) })
      }
    />
  );
}
