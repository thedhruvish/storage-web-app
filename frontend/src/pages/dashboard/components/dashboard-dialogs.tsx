import { useDashboard } from "../context/dashboard-context";
import { FileDeleteDialog } from "./dialog-delete-file";
import { RenameDialog } from "./dialog-file-rename";
import { NewDirectoryDialog } from "./dialog-new-directory";
import { MultiFileUploadDialog } from "./dialog-upload-file";

export function UsersDialogs() {
  const { open, setOpen } = useDashboard();
  return (
    <>
      <RenameDialog
        key='user-add'
        open={open === "rename"}
        onOpenChange={() => setOpen("rename")}
      />

      <FileDeleteDialog
        key={"delete-file"}
        open={open === "delete"}
        onOpenChange={() => setOpen("delete")}
      />
      <NewDirectoryDialog
        key={"new-directory"}
        open={open === "newDirectory"}
        onOpenChange={() => setOpen("newDirectory")}
      />
      <MultiFileUploadDialog
        key={"upload-file"}
        open={open === "uploadFile"}
        onOpenChange={() => setOpen("uploadFile")}
      />
    </>
  );
}
