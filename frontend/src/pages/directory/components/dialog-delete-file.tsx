import { useEffect, useState } from "react";
import { useDialogStore } from "@/store/dialogs-store";
import { useDirectoryStore } from "@/store/directory-store";
import { TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { useGetAllDirectoryList, useBatchs } from "@/api/directory-api";
import { ConfirmDialog } from "@/components/confirm-dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FileDeleteDialog({ open, onOpenChange }: Props) {
  const { currentItem, closeDialog, selectedItems } = useDialogStore();
  const { clearSelection } = useDirectoryStore();
  const [fileName, setFileName] = useState("");
  const batchOprations = useBatchs();
  const getallDirectorys = useGetAllDirectoryList();

  useEffect(() => {
    if (currentItem) {
      setFileName(currentItem.name);
    }
  }, [currentItem]);

  if (!currentItem) return;

  const isMultiple = selectedItems && selectedItems.length > 1;
  const fileType = isMultiple
    ? "items"
    : currentItem.extension
      ? "File"
      : "Directory";
  const displayName = isMultiple ? `${selectedItems.length} items` : fileName;

  // Check if item is in trash (soft deleted)
  const isTrash = !!currentItem.trashAt;

  const handleDelete = async () => {
    const itemsToDelete = isMultiple ? selectedItems : [currentItem];
    const documentIds = itemsToDelete
      .filter((i) => i.extension)
      .map((i) => i._id);
    const directoryIds = itemsToDelete
      .filter((i) => !i.extension)
      .map((i) => i._id);

    try {
      const promises = [];
      const actionType = isTrash ? "hdelete" : "sdelete";

      if (directoryIds.length > 0) {
        promises.push(
          batchOprations.mutateAsync({
            ids: directoryIds,
            type: "directory",
            action: actionType,
          })
        );
      }

      if (documentIds.length > 0) {
        promises.push(
          batchOprations.mutateAsync({
            ids: documentIds,
            type: "document",
            action: actionType,
          })
        );
      }

      await Promise.all(promises);
      toast.success(
        `${displayName} ${isTrash ? "permanently deleted" : "moved to trash"}`
      );
    } catch {
      toast.error(`Error deleting ${displayName}`);
    } finally {
      getallDirectorys.refetch();
      clearSelection();
      closeDialog();
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={batchOprations.isPending}
      title={
        <span className='text-destructive'>
          <TriangleAlert
            className='stroke-destructive mr-1 inline-block'
            size={18}
          />{" "}
          {isTrash
            ? `Delete ${isMultiple ? "Items" : fileType} Forever?`
            : `Delete ${isMultiple ? "Items" : fileType}`}
        </span>
      }
      desc={
        isTrash
          ? `Are you sure you want to permanently delete ${isMultiple ? "these items" : `this ${fileType}`}? This action cannot be undone.`
          : `Are you sure you want to move ${isMultiple ? "these items" : `this ${fileType}`} to trash?`
      }
      confirmText={isTrash ? "Delete Forever" : "Delete"}
      destructive
    />
  );
}
