import { FileDeleteDialog } from "@/pages/directory/components/dialog-delete-file";
import { RenameDialog } from "@/pages/directory/components/dialog-file-rename";
import { ImportFileDialog } from "@/pages/directory/components/dialog-import-file";
import { NewDirectoryDialog } from "@/pages/directory/components/dialog-new-directory";
import { ShareDialog } from "@/pages/directory/components/dialog-share";
import { MultiFileUploadDialog } from "@/pages/directory/components/dialog-upload-file";
import { useDialogStore } from "@/store/DialogsStore";

export function Dialogs() {
  const { open, setOpen, closeDialog } = useDialogStore();
  return (
    <>
      <RenameDialog
        key='user-add'
        open={open === "rename"}
        onOpenChange={(state) => (state ? setOpen("rename") : closeDialog())}
      />

      <FileDeleteDialog
        key='delete-file'
        open={open === "delete"}
        onOpenChange={(state) => (state ? setOpen("delete") : closeDialog())}
      />

      <NewDirectoryDialog key='new-directory' open={open === "newDirectory"} />

      <MultiFileUploadDialog key='upload-file' open={open === "uploadFile"} />

      <ImportFileDialog
        key='import-file'
        open={open === "importFile"}
        onOpenChange={(state) =>
          state ? setOpen("importFile") : closeDialog()
        }
      />
      <ShareDialog
        key='share-file'
        open={open === "share"}
        onOpenChange={(state) => (state ? setOpen("share") : closeDialog())}
      />
    </>
  );
}
