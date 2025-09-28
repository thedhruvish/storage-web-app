import { useDialogStore } from "@/store/DialogsStore";
import { FileUp, FolderPlus } from "lucide-react";
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";

export function HomePageContextMenu() {
  const { setOpen } = useDialogStore();
  return (
    <ContextMenuContent className='w-48 rounded-xl'>
      <ContextMenuItem
        onClick={() => setOpen("newDirectory")}
        className='cursor-pointer'
      >
        <FolderPlus className='mr-2 h-4 w-4' />
        <span>New Folder</span>
      </ContextMenuItem>

      <ContextMenuSeparator />

      <ContextMenuItem
        onClick={() => setOpen("uploadFile")}
        className='cursor-pointer'
      >
        <FileUp className='mr-2 h-4 w-4' />
        <span>File upload</span>
      </ContextMenuItem>
    </ContextMenuContent>
  );
}
