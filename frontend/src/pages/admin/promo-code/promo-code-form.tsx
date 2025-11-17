import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useCreatePromoCode } from "@/api/promo-code-api";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  createPromoCodeSchema,
  type PromoCodeFormValues,
} from "./promocode-schema";

export function PromoCodeForm() {
  const navigate = useNavigate();

  const { mutateAsync: createPromoCode } = useCreatePromoCode();
  const form = useForm<PromoCodeFormValues>({
    resolver: zodResolver(createPromoCodeSchema),
    defaultValues: {
      code: "",
      couponCode: "",
      isActive: true,
      expires_at: undefined,
      customer: undefined,
      max_redemptions: undefined,
    },
  });

  function onSubmit(data: PromoCodeFormValues) {
    toast.promise(createPromoCode(data), {
      loading: "Creating Promo Code...",
      error: "Promo Code creation failed",
      success: "Promo Code created successfully",
      action: {
        label: "Dismiss",
        onClick: () => {
          toast.dismiss();
        },
      },
    });
    navigate({ to: "/admin/promo-code" });
  }

  return (
    <Form {...form}>
      {/* Removed outer divs and created one main grid */}
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <div className='grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2'>
          {/* Code Field */}
          <FormField
            control={form.control}
            name='code'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Promo Code</FormLabel>
                <FormControl>
                  <Input placeholder='e.g., LAUNCH20' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Coupon Code Field */}
          <FormField
            control={form.control}
            name='couponCode'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stripe Coupon ID</FormLabel>
                <FormControl>
                  <Input placeholder='e.g., coup_Abc123...' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Customer Field */}
          <FormField
            control={form.control}
            name='customer'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder='e.g., cust_Xyz789...' {...field} />
                </FormControl>
                <FormDescription>
                  Limit this code to a specific customer ID.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Max Redemptions Field */}
          <FormField
            control={form.control}
            name='max_redemptions'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Redemptions (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    placeholder='e.g., 100'
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? undefined : +value);
                    }}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormDescription>
                  The maximum number of times this code can be used.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Expires At Field - Spans full width on medium screens */}
          <FormField
            control={form.control}
            name='expires_at'
            render={({ field }) => (
              <FormItem className='flex flex-col'>
                <FormLabel>Expires At (Optional)</FormLabel>
                <FormControl>
                  <DateTimePicker
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormDescription>
                  When this promo code should expire.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Is Active Field - Spans full width */}
          <FormField
            control={form.control}
            name='isActive'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                <div className='space-y-0.5'>
                  <FormLabel className='text-base'>Active</FormLabel>
                  <FormDescription>
                    Make this promo code active and redeemable.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <Button type='submit'>Create Promo Code</Button>
      </form>
    </Form>
  );
}
