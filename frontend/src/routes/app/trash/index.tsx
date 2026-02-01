import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { DirectoryContent } from "@/pages/directory/components/directory-content";
import { useUser } from "@/store/user-store";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useEmptyTrash, useGetAllTrash } from "@/api/directory-api";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";

export const Route = createFileRoute("/app/trash/")({
  component: TrashPage,
});

function TrashPage() {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const { mutate: emptyTrash, isPending: isEmptyTrashPending } =
    useEmptyTrash();

  const { data, isLoading, isError, error } = useGetAllTrash();

  const handleEmptyTrash = () => {
    emptyTrash(undefined, {
      onSuccess: () => {
        setOpen(false);
        toast.success("Trash emptied successfully");
      },
      onError: (err) => {
        toast.error(err.message || "Failed to empty trash");
      },
    });
  };

  const deleteButton = (
    <Button
      variant='destructive'
      size='sm'
      onClick={() => setOpen(true)}
      disabled={
        isEmptyTrashPending ||
        (!data?.data?.directories?.length && !data?.data?.documents?.length)
      }
    >
      <Trash2 className='mr-2 h-4 w-4' />
      Empty Trash
    </Button>
  );

  return (
    <>
      <DirectoryContent
        files={{
          directories: data?.data?.directories,
          documents: data?.data?.documents,
        }}
        isLoading={isLoading}
        isError={isError}
        error={error as Error}
        allowedUpload={false}
        emptyMessage='Trash is empty'
        directoryId={user?.rootDirId}
        onFileDoubleClick={() => {}} // Disable navigation
        enableContextMenu={false}
        extraToolbarActions={deleteButton}
        isTrash={true}
      />

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title='Empty Trash?'
        desc='Are you sure you want to permanently delete all items in the trash? This action cannot be undone.'
        confirmText='Delete All'
        destructive
        handleConfirm={handleEmptyTrash}
        isLoading={isEmptyTrashPending}
      />
    </>
  );
}
