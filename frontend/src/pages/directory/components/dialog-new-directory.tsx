import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useParams } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCreateDirectory } from "@/api/directoryApi";
import { useDialogStore } from "@/store/DialogsStore";

const formSchema = z.object({
  name: z.string().min(1, { message: "File name is required." }),
});
type NewDirectoryFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
}

export function NewDirectoryDialog({ open }: Props) {
  const { directoryId = "" } = useParams({ strict: false });
  const { closeDialog } = useDialogStore();
  const createDirectory = useCreateDirectory(directoryId);
  const form = useForm<NewDirectoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  });

  const onSubmit = async (values: NewDirectoryFormValues) => {
    const filename = values.name;
    if (!filename) return;
    try {
      await createDirectory.mutateAsync({
        data: { name: filename },
      });

      toast.success("Directory has been Create");
    } catch (error) {
      toast.error(`Error renaming file`);
    } finally {
      form.reset();
      closeDialog();
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        form.reset();
        closeDialog();
      }}
    >
      <DialogContent className='sm:max-w-md'>
        <DialogHeader className='text-left'>
          <DialogTitle className='flex items-center gap-2'>
            Create new Directory.
          </DialogTitle>
          <DialogDescription>
            Enter a name for the new directory
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='create-item'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter  Name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter className='gap-y-2'>
          <DialogClose asChild>
            <Button variant='outline'>Cancel</Button>
          </DialogClose>
          <Button type='submit' form='create-item'>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
