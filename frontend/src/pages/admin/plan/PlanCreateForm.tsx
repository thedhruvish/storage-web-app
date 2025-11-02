import { useEffect, useState } from "react";
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

// --- 2. Define Storage Units and Conversion Logic ---
const STORAGE_UNITS = ["MB", "GB", "TB"] as const;
type StorageUnit = (typeof STORAGE_UNITS)[number];

const BYTES_IN_UNIT: Record<StorageUnit, number> = {
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024,
  TB: 1024 * 1024 * 1024 * 1024,
};

/**
 * Finds the best human-readable unit and value from a number of bytes.
 */
function getHumanReadableStorage(bytes: number): {
  value: number;
  unit: StorageUnit;
} {
  if (bytes >= BYTES_IN_UNIT.TB) {
    return { value: Number((bytes / BYTES_IN_UNIT.TB).toFixed(2)), unit: "TB" };
  }
  if (bytes >= BYTES_IN_UNIT.GB) {
    return { value: Number((bytes / BYTES_IN_UNIT.GB).toFixed(2)), unit: "GB" };
  }
  // Default to MB
  const mbValue = Number((bytes / BYTES_IN_UNIT.MB).toFixed(2));
  return { value: Math.max(mbValue, 1), unit: "MB" };
}
// --- End of Storage Logic ---

export function PlanCreateForm() {
  const { mutate: createNewPlan, isPending: isCreatingPlan } =
    useCreateNewPlan();
  const navigation = useNavigate();

  // 3. Set up default value and local state for the UI
  const defaultBytes = 1 * BYTES_IN_UNIT.GB; // Default to 1 GB
  const initialStorage = getHumanReadableStorage(defaultBytes);

  const [storageValue, setStorageValue] = useState<number>(
    initialStorage.value
  );
  const [storageUnit, setStorageUnit] = useState<StorageUnit>(
    initialStorage.unit
  );

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planCreateValidation),
    defaultValues: {
      title: "",
      description: "",
      priceINR: 1,
      priceUSD: 1,
      interval: "month",
      totalBytes: defaultBytes, // 4. Set RHF default in bytes
      isActive: true,
    },
  });

  // 5. Sync local UI state (value + unit) to the RHF state (totalBytes)
  useEffect(() => {
    const totalBytes = Math.round(
      (storageValue || 0) * BYTES_IN_UNIT[storageUnit]
    );
    form.setValue("totalBytes", totalBytes, { shouldValidate: true });
  }, [storageValue, storageUnit, form]);

  // 6. Watch the RHF value to display the formatted size
  const totalBytesWatched = form.watch("totalBytes");

  function onSubmit(values: PlanFormValues) {
    // `values.totalBytes` will be the calculated number in bytes
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

          {/* --- 7. UPDATED Storage Quota Field --- */}
          <FormField
            control={form.control}
            name='totalBytes' // This field now controls validation
            render={() => (
              <FormItem>
                <FormLabel>Storage Quota</FormLabel>
                <div className='flex gap-2'>
                  <FormControl>
                    <Input
                      type='number'
                      placeholder='10'
                      min='1'
                      value={storageValue}
                      onChange={(e) =>
                        setStorageValue(parseFloat(e.target.value) || 0)
                      }
                      className='w-2/3' // Adjust width as needed
                    />
                  </FormControl>
                  <Select
                    value={storageUnit}
                    onValueChange={(value: string) =>
                      setStorageUnit(value as StorageUnit)
                    }
                  >
                    <FormControl>
                      <SelectTrigger className='w-1/3'>
                        <SelectValue placeholder='Select unit' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STORAGE_UNITS.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <FormDescription>
                  Total storage Bytes: {totalBytesWatched}
                </FormDescription>
                <FormMessage /> {/* This will show errors for totalBytes */}
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
