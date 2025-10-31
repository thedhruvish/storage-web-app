import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { useCreateNewPlan } from "@/api/planApi";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { planCreateValidation, type PlanFormValues } from "./schema";

export function PlanCreateForm() {
  const { mutate: createNewPlan, isPending: isCreatingPlan } =
    useCreateNewPlan();
  const navigation = useNavigate();
  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planCreateValidation),
    defaultValues: {
      title: "",
      description: "",
      priceINR: 1,
      priceUSD: 1,
      interval: "month",
      totalBytes: 1000000, // Example default
      isActive: true,
    },
  });

  // 4. Create the submit handler
  function onSubmit(values: PlanFormValues) {
    createNewPlan(values, {
      onSuccess: () => {
        navigation({ to: "/admin/plan" });
      },
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        {/* Title */}
        <FormField
          control={form.control}
          name='title'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plan Title</FormLabel>
              <FormControl>
                <Input placeholder='E.g. Pro Plan' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='A brief description of what this plan includes.'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Prices (in a grid) */}
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          <FormField
            control={form.control}
            name='priceINR'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (INR)</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    placeholder='999'
                    min='1'
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value) || 0)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='priceUSD'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (USD)</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    placeholder='19'
                    min='1'
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value) || 0)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Interval & Bytes (in a grid) */}
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          <FormField
            control={form.control}
            name='interval'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Billing Interval</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select an interval' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='month'>Monthly</SelectItem>
                    <SelectItem value='year'>Yearly</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='totalBytes'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Bytes</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    placeholder='1000000'
                    min='1000'
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value) || 0)
                    }
                  />
                </FormControl>
                <FormDescription>Total storage quota in bytes.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Is Active (Switch) */}
        <FormField
          control={form.control}
          name='isActive'
          render={({ field }) => (
            <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
              <div className='space-y-0.5'>
                <FormLabel>Active Plan</FormLabel>
                <FormDescription>
                  Is this plan available for new subscriptions?
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

        <Button type='submit' disabled={isCreatingPlan}>
          {isCreatingPlan ? (
            <>
              <Spinner /> {"Plan Creating"}
            </>
          ) : (
            "Create Plan"
          )}
        </Button>
      </form>
    </Form>
  );
}
