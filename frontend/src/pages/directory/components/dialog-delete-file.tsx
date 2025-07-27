import { useEffect, useState } from "react";
import { TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { useParams } from "@tanstack/react-router";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useDeleteDirectory } from "@/api/directoryApi";
import { useDeleteDocument } from "@/api/docuementApi";
import { useDialogStore } from "@/store/DialogsStore";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FileDeleteDialog({ open, onOpenChange }: Props) {
  const { directoryId } = useParams({ strict: false });
  const [value, setValue] = useState("");
  const { currentItem, closeDialog } = useDialogStore();
  const [fileName, setFileName] = useState("");
  const deleteDirectory = useDeleteDirectory(directoryId);
  const deleteDocument = useDeleteDocument(directoryId);

  useEffect(() => {
    if (currentItem) {
      setFileName(currentItem.name);
    }
  }, [currentItem]);
  if (!currentItem) return;
  const fileType = currentItem.extension ? "File" : "Directory";

  const handleDelete = async () => {
    if (value.trim() !== fileName) return;
    try {
      if (currentItem.extension) {
        await deleteDocument.mutateAsync({
          id: currentItem._id,
        });
      } else {
        await deleteDirectory.mutateAsync({
          id: currentItem._id,
        });
      }
      toast.success(`${fileName} has been deleted`);
    } catch (error) {
      toast.error(`Error deleting ${fileName}`);
    } finally {
      setValue("");
      closeDialog();
    }
  };
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== fileName}
      title={
        <span className='text-destructive'>
          <TriangleAlert
            className='stroke-destructive mr-1 inline-block'
            size={18}
          />{" "}
          Delete {fileType}
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Are you sure you want to delete{" "}
            <span className='font-bold'>{fileName}</span>?
            <br />
            This action will permanently remove the {fileType} with the name of{" "}
            <span className='font-bold'>{fileName}</span> from the system. This
            cannot be undone.
          </p>

          <Label className='my-2'>
            {fileType} Name:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Enter ${fileType} name to confirm deletion.`}
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              Please be carefull, this operation can not be rolled back.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText='Delete'
      destructive
    />
  );
}
