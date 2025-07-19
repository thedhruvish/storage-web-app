import {
  Download,
  FolderPen,
  MoreVertical,
  Share,
  Star,
  Trash2,
} from "lucide-react";
import { useEffect } from "react";
import { useDashboard } from "../context/dashboard-context";
import type { FileItem } from "../types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface Props {
  file: FileItem;
  buttonViewType: "grid" | "list";
}

export default function FileDropdownMenu({ file, buttonViewType }: Props) {
  const { setOpen, setCurrentItem } = useDashboard();
  useEffect(() => {
    setCurrentItem(file);
  }, []);
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
        <DropdownMenuItem onClick={() => setOpen("download")}>
          <Download className='mr-2 h-4 w-4' />
          Download
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setOpen("rename")}>
          <FolderPen className='mr-2 h-4 w-4' />
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setOpen("share")}>
          <Share className='mr-2 h-4 w-4' />
          Share
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setOpen("star")}>
          <Star className='mr-2 h-4 w-4' />
          {file.starred ? "Unstar" : "Star"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className='text-destructive'
          onClick={() => setOpen("delete")}
        >
          <Trash2 className='mr-2 h-4 w-4' />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
