import { useEffect, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { useDialogStore } from "@/store/dialogs-store";
import { TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import {
  useDeleteDirectory,
  useGetAllDirectoryList,
} from "@/api/directory-api";
import { useDeleteDocument } from "@/api/docuement-api";
import { ConfirmDialog } from "@/components/confirm-dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FileDeleteDialog({ open, onOpenChange }: Props) {
  const { directoryId } = useParams({ strict: false });
  const { currentItem, closeDialog } = useDialogStore();
  const [fileName, setFileName] = useState("");
  const deleteDirectory = useDeleteDirectory(directoryId);
  const deleteDocument = useDeleteDocument(directoryId);
  const getallDirectorys = useGetAllDirectoryList();

  useEffect(() => {
    if (currentItem) {
      setFileName(currentItem.name);
    }
  }, [currentItem]);
  if (!currentItem) return;
  const fileType = currentItem.extension ? "File" : "Directory";

  const handleDelete = async () => {
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
    } catch {
      toast.error(`Error deleting ${fileName}`);
    } finally {
      getallDirectorys.refetch();
      closeDialog();
    }
  };
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={deleteDocument.isPending || deleteDirectory.isPending}
      title={
        <span className='text-destructive'>
          <TriangleAlert
            className='stroke-destructive mr-1 inline-block'
            size={18}
          />{" "}
          Delete {fileType}
        </span>
      }
      desc={"Are you sure you want to delete this " + fileType + "?"}
      confirmText='Delete'
      destructive
    />
  );
}
