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
}

export default function FileDropdownMenu({ file, buttonViewType }: Props) {
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
          className={
            buttonViewType === "grid"
              ? "absolute top-1 right-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
              : "h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
          }
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        {file.extension && (
          <DropdownMenuItem onClick={filedonw}>
            <Download className='mr-2 h-4 w-4' />
            Download
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => openDialog("rename")}>
          <FolderPen className='mr-2 h-4 w-4' />
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openDialog("share")}>
          <Share className='mr-2 h-4 w-4' />
          Share
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openDialog("star")}>
          <Star className='mr-2 h-4 w-4' />
          {file.starred ? "Unstar" : "Star"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className='text-destructive'
          onClick={() => openDialog("delete")}
        >
          <Trash2 className='mr-2 h-4 w-4' />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
