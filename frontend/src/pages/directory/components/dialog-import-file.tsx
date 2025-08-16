import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "@tanstack/react-router";
import { useDialogStore } from "@/store/DialogsStore";
import { toast } from "sonner";
import {
  checkConnectedGoogle,
  useImportFolderByDrive,
} from "@/api/importDataApi";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
const formSchema = z.object({
  id: z.string().min(1, { message: "File name is required." }),
});
type SearchFormValues = z.infer<typeof formSchema>;

export function ImportFileDialog({ open, onOpenChange }: Props) {
  const { closeDialog } = useDialogStore();
  // get params to which directory upload the data
  const { directoryId = "" } = useParams({ strict: false });
  const [isSearchShow, setIsSearchShow] = useState(false);
  const checkGoogleDriveConnected = checkConnectedGoogle();
  const importGoogleDriveFolder = useImportFolderByDrive(directoryId);

  // form defuault values
  const form = useForm<SearchFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { id: "" },
  });

  // check if user to alrady conneted with 0auth
  useEffect(() => {
    if (checkGoogleDriveConnected.isSuccess) {
      setIsSearchShow(checkGoogleDriveConnected.data.data.is_connected);
    }
  }, [checkGoogleDriveConnected.isSuccess]);

  // sumit values to the server
  const onSubmit = (values: SearchFormValues) => {
    const folderId = values.id;
    if (!folderId) return;
    try {
      importGoogleDriveFolder.mutate(
        { id: folderId },
        {
          onSuccess: () => {
            closeDialog();
            toast.success("File want successfully imported.");
          },
        }
      );
      toast.success(
        "Folder are imported it will take some time Do not close or refresh page"
      );
    } catch (error) {
      toast.error(`Error renaming file`);
    } finally {
      form.reset();
      closeDialog();
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {isSearchShow ? (
        // write a id if user conneted by oath2
        <DialogContent className='sm:max-w-md'>
          <DialogHeader className='text-left'>
            <DialogTitle className='flex items-center gap-2'>
              Import By Id
            </DialogTitle>
            <DialogDescription>Enter Import Directory Id</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              id='create-item'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4'
            >
              <FormField
                control={form.control}
                name='id'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter Google Drive Id' {...field} />
                    </FormControl>
                    <FormDescription>
                      Example of 1k-Mo7xgbmXPYF8S9uNPPWdcs92SdiXuV
                    </FormDescription>
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
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      ) : (
        // give login button with oath2
        <DialogContent className='sm:max-w-md'>
          <DialogHeader className='text-left'>
            <DialogTitle className='flex items-center gap-2'>
              Import File
            </DialogTitle>
            <DialogDescription>
              Import Google Drive Data in current directory .
            </DialogDescription>
          </DialogHeader>
          <div className='flex w-full items-center gap-2'>
            <Button
              variant={"outline"}
              onClick={() => {
                window.location.href = `${import.meta.env.VITE_BASE_URL}/import-data/google/oauthurlgen`;
              }}
            >
              Import to Google Drive
            </Button>
          </div>
          <DialogFooter className='gap-y-2'>
            <DialogClose asChild>
              <Button variant='outline'>Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}
