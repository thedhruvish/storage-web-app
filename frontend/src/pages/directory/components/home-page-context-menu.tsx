import { useDialogStore } from "@/store/dialogs-store";
import { FileUp, FolderPlus } from "lucide-react";
import { useFileUploader } from "@/hooks/use-file-uploader";
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";

export function HomePageContextMenu() {
  const { setOpen } = useDialogStore();
  const { triggerUploader, UploaderInput } = useFileUploader();

  return (
    <>
      {UploaderInput}
      <ContextMenuContent className='w-48 rounded-xl'>
        <ContextMenuItem
          onClick={() => setOpen("newDirectory")}
          className='cursor-pointer'
        >
          <FolderPlus className='mr-2 h-4 w-4' />
          <span>New Folder</span>
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem onClick={triggerUploader} className='cursor-pointer'>
          <FileUp className='mr-2 h-4 w-4' />
          <span>File upload</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </>
  );
}
