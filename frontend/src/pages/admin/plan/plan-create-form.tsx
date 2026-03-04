import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useCreateNewPlan } from "@/api/plan-api";
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

const STORAGE_UNITS = ["MB", "GB", "TB"] as const;
type StorageUnit = (typeof STORAGE_UNITS)[number];

const BYTES_IN_UNIT: Record<StorageUnit, number> = {
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024,
  TB: 1024 * 1024 * 1024 * 1024,
};

function getHumanReadableStorage(bytes: number): {
  value: number;
  unit: StorageUnit;
} {
  if (bytes >= BYTES_IN_UNIT.TB) {
    return { value: bytes / BYTES_IN_UNIT.TB, unit: "TB" };
  }
  if (bytes >= BYTES_IN_UNIT.GB) {
    return { value: bytes / BYTES_IN_UNIT.GB, unit: "GB" };
  }
  return { value: bytes / BYTES_IN_UNIT.MB, unit: "MB" };
}

export function PlanCreateForm() {
  const { mutate: createNewPlan, isPending: isCreatingPlan } =
    useCreateNewPlan();
  const navigation = useNavigate();

  const defaultTotalBytes = 1 * BYTES_IN_UNIT.GB;
  const defaultUploadBytes = 100 * BYTES_IN_UNIT.MB;

  const initialStorage = getHumanReadableStorage(defaultTotalBytes);
  const initialUpload = getHumanReadableStorage(defaultUploadBytes);

  const [storageValue, setStorageValue] = useState<number>(
    initialStorage.value
  );
  const [storageUnit, setStorageUnit] = useState<StorageUnit>(
    initialStorage.unit
  );

  const [uploadValue, setUploadValue] = useState<number>(initialUpload.value);
  const [uploadUnit, setUploadUnit] = useState<StorageUnit>(initialUpload.unit);

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planCreateValidation),
    defaultValues: {
      title: "",
      description: "",
      monthlyPriceINR: 1,
      monthlyPriceUSD: 1,
      yearlyPriceINR: 1,
      yearlyPriceUSD: 1,
      totalBytes: defaultTotalBytes,
      uploadLimit: defaultUploadBytes,
      isActive: true,
      isPopular: false,
      features: [{ value: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "features",
    control: form.control,
  });

  useEffect(() => {
    const bytes = Math.round((storageValue || 0) * BYTES_IN_UNIT[storageUnit]);
    form.setValue("totalBytes", bytes, { shouldValidate: true });
  }, [storageValue, storageUnit, form]);

  useEffect(() => {
    const bytes = Math.round((uploadValue || 0) * BYTES_IN_UNIT[uploadUnit]);
    form.setValue("uploadLimit", bytes, { shouldValidate: true });
  }, [uploadValue, uploadUnit, form]);

  const totalBytesWatched = form.watch("totalBytes");
  const uploadLimitWatched = form.watch("uploadLimit");

  function onSubmit(values: PlanFormValues) {
    const payload = {
      ...values,
      features: values.features?.map((f) => f.value) || [],
    };
    createNewPlan(payload as any, {
      onSuccess: () => {
        navigation({ to: "/admin/plan" });
      },
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
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

        {/* Monthly Prices */}
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          <FormField
            control={form.control}
            name='monthlyPriceINR'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monthly Price (INR)</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    placeholder='999'
                    min='0'
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
            name='monthlyPriceUSD'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monthly Price (USD)</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    placeholder='19'
                    min='0'
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

        {/* Yearly Prices */}
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          <FormField
            control={form.control}
            name='yearlyPriceINR'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Yearly Price (INR)</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    placeholder='9999'
                    min='0'
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
            name='yearlyPriceUSD'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Yearly Price (USD)</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    placeholder='199'
                    min='0'
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

        <FormField
          control={form.control}
          name='totalBytes'
          render={() => (
            <FormItem>
              <FormLabel>Storage Quota</FormLabel>
              <div className='flex gap-2'>
                <FormControl>
                  <Input
                    type='number'
                    min='0'
                    value={storageValue}
                    onChange={(e) =>
                      setStorageValue(parseFloat(e.target.value) || 0)
                    }
                    className='w-2/3'
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
                      <SelectValue />
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
                Total storage in bytes: {totalBytesWatched}
              </FormDescription>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* Upload Limit */}
        <FormField
          control={form.control}
          name='uploadLimit'
          render={() => (
            <FormItem>
              <FormLabel>Upload File Quota</FormLabel>
              <div className='flex gap-2'>
                <FormControl>
                  <Input
                    type='number'
                    min='0'
                    value={uploadValue}
                    onChange={(e) =>
                      setUploadValue(parseFloat(e.target.value) || 0)
                    }
                    className='w-2/3'
                  />
                </FormControl>

                <Select
                  value={uploadUnit}
                  onValueChange={(value: string) =>
                    setUploadUnit(value as StorageUnit)
                  }
                >
                  <FormControl>
                    <SelectTrigger className='w-1/3'>
                      <SelectValue />
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
                Upload limit in bytes: {uploadLimitWatched}
              </FormDescription>

              <FormMessage />
            </FormItem>
          )}
        />

        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <FormLabel className='text-base'>Features</FormLabel>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => append({ value: "" })}
            >
              <Plus className='mr-2 h-4 w-4' />
              Add Feature
            </Button>
          </div>
          {fields.map((field, index) => (
            <FormField
              key={field.id}
              control={form.control}
              name={`features.${index}.value`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className='flex items-center gap-2'>
                      <Input {...field} placeholder='E.g. 50GB Storage' />
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                      >
                        <Trash2 className='h-4 w-4 text-destructive' />
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        {/* Active & Popular Switch */}
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          <FormField
            control={form.control}
            name='isActive'
            render={({ field }) => (
              <FormItem className='flex items-center justify-between rounded-lg border p-4'>
                <div>
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

          <FormField
            control={form.control}
            name='isPopular'
            render={({ field }) => (
              <FormItem className='flex items-center justify-between rounded-lg border p-4'>
                <div>
                  <FormLabel>Popular Plan</FormLabel>
                  <FormDescription>
                    Highlight this plan as the most popular choice.
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

        <Button type='submit' disabled={isCreatingPlan}>
          {isCreatingPlan ? (
            <>
              <Spinner /> Plan Creating
            </>
          ) : (
            "Create Plan"
          )}
        </Button>
      </form>
    </Form>
  );
}
