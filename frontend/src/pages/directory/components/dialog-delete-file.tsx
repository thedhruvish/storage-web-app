import { useEffect, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { useDialogStore } from "@/store/dialogs-store";
import { TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import {
  useDeleteDirectory,
  useGetAllDirectoryList,
  useHardDelete,
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
  const hardDelete = useHardDelete();
  const getallDirectorys = useGetAllDirectoryList();

  useEffect(() => {
    if (currentItem) {
      setFileName(currentItem.name);
    }
  }, [currentItem]);
  if (!currentItem) return;
  const fileType = currentItem.extension ? "File" : "Directory";

  // Check if item is in trash (soft deleted)
  const isTrash = !!currentItem.trashAt;

  const handleDelete = async () => {
    try {
      if (isTrash) {
        // PERMANENT DELETE
        await hardDelete.mutateAsync({
          id: currentItem._id,
          type: currentItem.extension ? "document" : "directory",
        });
        toast.success(`${fileName} permanently deleted`);
      } else {
        // SOFT DELETE
        if (currentItem.extension) {
          await deleteDocument.mutateAsync({
            id: currentItem._id,
          });
        } else {
          await deleteDirectory.mutateAsync({
            id: currentItem._id,
          });
        }
        toast.success(`${fileName} moved to trash`);
      }
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
      disabled={
        deleteDocument.isPending ||
        deleteDirectory.isPending ||
        hardDelete.isPending
      }
      title={
        <span className='text-destructive'>
          <TriangleAlert
            className='stroke-destructive mr-1 inline-block'
            size={18}
          />{" "}
          {isTrash ? `Delete ${fileType} Forever?` : `Delete ${fileType}`}
        </span>
      }
      desc={
        isTrash
          ? `Are you sure you want to permanently delete this ${fileType}? This action cannot be undone.`
          : `Are you sure you want to move this ${fileType} to trash?`
      }
      confirmText={isTrash ? "Delete Forever" : "Delete"}
      destructive
    />
  );
}
