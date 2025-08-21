import { useDialogStore } from "@/store/DialogsStore";
import {
  Download,
  FolderPen,
  MoreVertical,
  Share,
  Star,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { FileItem } from "../types";

interface Props {
  file: FileItem;
  buttonViewType: "grid" | "list";
  fileType: "folder" | "file";
}

export default function FileDropdownMenu({
  file,
  buttonViewType,
  fileType,
}: Props) {
  const { setOpen, setCurrentItem } = useDialogStore();

  const openDialog = (type: Parameters<typeof setOpen>[0]) => {
    setOpen(type);
    setCurrentItem({ ...file, type: file.extension ? "file" : "folder" });
  };

  const filedonw = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/document/${file._id}?action=download`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className={`rounded-full hover:bg-muted transition 
            ${
              buttonViewType === "grid"
                ? "absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100"
                : "h-8 w-8 opacity-0 group-hover:opacity-100"
            }`}
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className='h-4 w-4 text-muted-foreground' />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align='end'
        className='w-40 rounded-xl shadow-lg border bg-popover text-sm'
      >
        {file.extension && (
          <DropdownMenuItem
            onClick={filedonw}
            className='cursor-pointer hover:bg-accent hover:text-accent-foreground'
          >
            <Download className='mr-2 h-4 w-4' />
            Download
          </DropdownMenuItem>
        )}

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
          onClick={() => openDialog("star")}
          className='cursor-pointer hover:bg-accent hover:text-accent-foreground'
        >
          <Star className='mr-2 h-4 w-4' />
          {file.starred ? "Unstar" : "Star"}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className='cursor-pointer text-destructive hover:bg-destructive/10'
          onClick={() => openDialog("delete")}
        >
          <Trash2 className='mr-2 h-4 w-4' />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
