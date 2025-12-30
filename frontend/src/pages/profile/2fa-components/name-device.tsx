import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const nameSchema = z.object({
  name: z
    .string()
    .max(20, "Name not allowed this length is less than 20 characters")
    .min(1, "Name is required"),
});

interface NameDeviceProps {
  onBack: () => void;
  onSubmit: (name: string) => void;
  isLoading: boolean;
}

export function NameDevice({ onBack, onSubmit, isLoading }: NameDeviceProps) {
  const form = useForm<z.infer<typeof nameSchema>>({
    resolver: zodResolver(nameSchema),
    defaultValues: {
      name: "",
    },
  });

  const handleSubmit = (data: z.infer<typeof nameSchema>) => {
    onSubmit(data.name);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className='animate-in fade-in slide-in-from-right-4 duration-300'
      >
        <div className='flex flex-col space-y-1.5 text-center sm:text-left'>
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='icon'
              type='button' // Important to prevent form submission
              className='h-6 w-6 -ml-2'
              onClick={onBack}
            >
              <ArrowLeft className='h-4 w-4' />
            </Button>
            <h2 className='text-lg font-semibold leading-none tracking-tight'>
              Name your device
            </h2>
          </div>
          <p className='text-sm text-muted-foreground'>
            Give this verification method a memorable name.
          </p>
        </div>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem className='grid gap-4 py-4'>
              <FormLabel>Friendly Name</FormLabel>
              <FormControl>
                <Input
                  placeholder='e.g. My iPhone, Work Laptop'
                  autoFocus
                  // Handle Enter key manually if needed, but form submit handles it usually.
                  // Preserving original behavior keydown check if desired, but form submit is standard.
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2'>
          <Button type='submit' disabled={isLoading || !form.formState.isValid}>
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Setting up...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
