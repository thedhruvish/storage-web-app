import { useDialogStore } from "@/store/DialogsStore";
import {
  Download,
  FolderPen,
  InfoIcon,
  Share,
  Star,
  StarOff,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { usestarredToggle } from "../../../api/directoryApi";
import type { FileItem } from "../types";

interface Props {
  file: FileItem;
  fileType: "folder" | "file";
}

export default function FileMenuItems({ file, fileType }: Props) {
  const { setOpen, setCurrentItem } = useDialogStore();
  const starredMutation = usestarredToggle();

  const openDialog = (type: Parameters<typeof setOpen>[0]) => {
    setOpen(type);
    setCurrentItem({ ...file, type: file.extension ? "file" : "folder" });
  };

  const filedownload = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/document/${file._id}?action=download`;
  };

  const starredToggle = () => {
    if (!file._id) return;
    starredMutation.mutate(
      {
        id: file._id,
        type: file.extension ? "document" : "directory",
      },
      {
        onSuccess: () => {
          toast.success(
            file.isStarred ? "Unstarred successfully" : "Starred successfully"
          );
        },
        onError: () => {
          toast.error("An error occurred");
        },
      }
    );
  };

  return (
    <>
      {file.extension && (
        <DropdownMenuItem
          onClick={filedownload}
          className='cursor-pointer hover:bg-accent hover:text-accent-foreground'
        >
          <Download className='mr-2 h-4 w-4' />
          Download
        </DropdownMenuItem>
      )}
      <DropdownMenuItem
        onClick={() => openDialog("details")}
        className='cursor-pointer hover:bg-accent hover:text-accent-foreground'
      >
        <InfoIcon className='mr-2 h-4 w-4' />
        Details
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => openDialog("rename")}
        className='cursor-pointer hover:bg-accent hover:text-accent-foreground'
      >
        <FolderPen className='mr-2 h-4 w-4' />
        Rename
      </DropdownMenuItem>

      {fileType === "folder" && (
        <DropdownMenuItem
          onClick={() => openDialog("share")}
          className='cursor-pointer hover:bg-accent hover:text-accent-foreground'
        >
          <Share className='mr-2 h-4 w-4' />
          Share
        </DropdownMenuItem>
      )}

      <DropdownMenuItem
        onClick={starredToggle}
        className='cursor-pointer hover:bg-accent hover:text-accent-foreground flex items-center'
      >
        {file.isStarred ? (
          <StarOff className='mr-2 h-4 w-4 text-gray-500' />
        ) : (
          <Star className='mr-2 h-4 w-4 fill-yellow-500 text-yellow-500' />
        )}
        <span>{file.isStarred ? "Unstar" : "Star"}</span>
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem
        className='cursor-pointer text-destructive hover:bg-destructive/10'
        onClick={() => openDialog("delete")}
      >
        <Trash2 className='mr-2 h-4 w-4' />
        Delete
      </DropdownMenuItem>
    </>
  );
}
