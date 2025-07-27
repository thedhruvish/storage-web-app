import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { toast } from "sonner";
import { useParams } from "@tanstack/react-router";
import { useDashboard } from "../context/dashboard-context";
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
import { useUpdateDirectory } from "@/api/directoryApi";
import { useUpdateDocument } from "@/api/docuementApi";

const formSchema = z.object({
  name: z.string().min(1, { message: "File name is required." }),
});
type RenameFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RenameDialog({ open, onOpenChange }: Props) {
  const { directoryId = "" } = useParams({ strict: false });

  const { currentItem, setCurrentItem } = useDashboard();
  const updateDirectory = useUpdateDirectory(directoryId);
  const updateDocument = useUpdateDocument(directoryId);

  const form = useForm<RenameFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (currentItem) {
      let nameOnly = currentItem.name;
      console.log(currentItem.extension);
      if (
        currentItem.extension &&
        nameOnly.endsWith(`${currentItem.extension}`)
      ) {
        nameOnly = nameOnly.slice(0, -1 * currentItem.extension.length);
      }
      form.setValue("name", nameOnly);
    }
  }, [currentItem, form]);

  const onSubmit = async (values: RenameFormValues) => {
    console.log("Rename to:", values.name);
    if (!currentItem) return;
    const filename = values.name;
    try {
      if (currentItem.extension) {
        await updateDocument.mutateAsync({
          id: currentItem._id,
          data: { name: filename + currentItem.extension },
        });
      } else {
        await updateDirectory.mutateAsync({
          id: currentItem._id,
          data: { name: filename },
        });
      }

      toast.success("File has been renamed");
    } catch (error) {
      toast.error(`Error renaming file`);
    } finally {
      form.reset();
      setCurrentItem(null);
      onOpenChange(false);
    }
  };

  if (!currentItem) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset();
        onOpenChange(state);
      }}
    >
      <DialogContent className='sm:max-w-md'>
        <DialogHeader className='text-left'>
          <DialogTitle className='flex items-center gap-2'>
            Rename {currentItem.fileType === "document" ? "Document" : "File"}
          </DialogTitle>
          <DialogDescription>
            Rename <b>{currentItem.name}</b> to{" "}
            <b>
              <i>
                {form.watch("name")}
                {currentItem.extension}
              </i>
            </b>
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='rename-item'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rename</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter new name' {...field} />
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
          <Button type='submit' form='rename-item'>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
