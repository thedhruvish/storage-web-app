import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useCreateCoupon } from "@/api/coupon-api";
import { Button } from "@/components/ui/button";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createCouponSchema, type CouponFormValues } from "./coupon-schema";

export function CouponForm() {
  const navigate = useNavigate();
  const { mutateAsync: createCoupon } = useCreateCoupon();

  const [discountType, setDiscountType] = React.useState<"percent" | "amount">(
    "percent"
  );

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(createCouponSchema),
    defaultValues: {
      code: "",
      amount_off: undefined,
      percent_off: 25,
    },
  });

  const handleDiscountTypeChange = (value: "percent" | "amount") => {
    setDiscountType(value);
    if (value === "percent") {
      form.setValue("amount_off", undefined);
      form.clearErrors("amount_off");
    } else {
      form.setValue("percent_off", undefined);
      form.clearErrors("percent_off");
    }
  };

  function onSubmit(data: CouponFormValues) {
    toast.promise(createCoupon(data), {
      loading: "Creating coupon...",
      error: "Coupon creation failed",
      success: "Coupon created successfully",
      action: {
        label: "Dismiss",
        onClick: () => {
          toast.dismiss();
        },
      },
    });
    navigate({ to: "/admin/coupon" });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <div className='grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2'>
          <FormField
            control={form.control}
            name='code'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Coupon Code</FormLabel>
                <FormControl>
                  <Input placeholder='e.g., BLACKFRIDAY25' {...field} />
                </FormControl>
                <FormDescription>
                  This is the code your customers will enter at checkout.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Discount Type Radio Group */}
          <FormItem className='space-y-3'>
            <FormLabel>Discount Type</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={handleDiscountTypeChange}
                defaultValue={discountType}
                className='flex flex-col space-y-1'
              >
                <FormItem className='flex items-center space-x-3 space-y-0'>
                  <FormControl>
                    <RadioGroupItem value='percent' />
                  </FormControl>
                  <FormLabel className='font-normal'>Percentage Off</FormLabel>
                </FormItem>
                <FormItem className='flex items-center space-x-3 space-y-0'>
                  <FormControl>
                    <RadioGroupItem value='amount' />
                  </FormControl>
                  <FormLabel className='font-normal'>
                    Fixed Amount Off
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>

          {/* Percent Off Field */}
          {discountType === "percent" && (
            <FormField
              control={form.control}
              name='percent_off'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Percent Off</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      placeholder='e.g., 25'
                      min={1}
                      max={100}
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === "" ? undefined : +value);
                      }}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter a value between 1 and 100.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Amount Off Field */}
          {discountType === "amount" && (
            <FormField
              control={form.control}
              name='amount_off'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount Off (in Cents/Paise)</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      placeholder='e.g., 500 (for $5.00)'
                      min={1}
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === "" ? undefined : +value);
                      }}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Value must be in the smallest currency unit (e.g., cents).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <Button type='submit'>Create Coupon</Button>
      </form>
    </Form>
  );
}
