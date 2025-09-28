import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { FileItem } from "../types";
import FileMenuItems from "./file-menu-items";

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
        // Stop propagation to prevent the context menu from closing the parent
        onClick={(e) => e.stopPropagation()}
      >
        <FileMenuItems file={file} fileType={fileType} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
