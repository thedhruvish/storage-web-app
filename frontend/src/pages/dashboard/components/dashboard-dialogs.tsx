import { useDashboard } from "../context/dashboard-context";
import { RenameDialog } from "./file-rename-dialog";

export function UsersDialogs() {
  const { open, setOpen } = useDashboard();
  console.log(open);
  return (
    <>
      <RenameDialog
        key='user-add'
        open={open === "rename"}
        onOpenChange={() => setOpen("rename")}
      />
    </>
  );
}
