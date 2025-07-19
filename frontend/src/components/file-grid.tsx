import {
  Archive,
  Code,
  Download,
  File,
  FileText,
  Folder,
  ImageIcon,
  MoreVertical,
  Music,
  Share,
  Star,
  Trash2,
  Video,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getFileIconName } from "@/utils/file-icon-helper";

interface FileItem {
  _id: string;
  name: string;
  fileType?: "document" | "image" | "video" | "audio" | "other";
  size?: string;
  modifiedAt: Date;
  starred?: boolean;
  extension: string;
}

interface FileGridProps {
  files: Array<FileItem>;
  documentType: "folder" | "file";

  viewMode: "grid" | "list";
  onFileClick?: (file: FileItem) => void;
}

const getFileIcon = (document: string, file: FileItem) => {
  if (document === "folder") {
    return <Folder className='h-8 w-8 text-blue-500' />;
  }

  const iconType = getFileIconName(file.extension);

  switch (iconType) {
    case "document":
    case "word":
      return <FileText className='h-8 w-8 text-blue-600' />;
    case "pdf":
      return <FileText className='h-8 w-8 text-red-600' />;
    case "image":
      return <ImageIcon className='h-8 w-8 text-green-600' />;
    case "vector":
      return <ImageIcon className='h-8 w-8 text-emerald-600' />;
    case "video":
      return <Video className='h-8 w-8 text-orange-600' />;
    case "audio":
      return <Music className='h-8 w-8 text-purple-600' />;
    case "archive":
      return <Archive className='h-8 w-8 text-yellow-600' />;
    case "spreadsheet":
      return <FileText className='h-8 w-8 text-lime-600' />;
    case "presentation":
      return <FileText className='h-8 w-8 text-amber-600' />;
    case "font":
      return <FileText className='h-8 w-8 text-pink-600' />;
    case "executable":
      return <File className='h-8 w-8 text-zinc-600' />;
    case "database":
      return <File className='h-8 w-8 text-teal-600' />;
    case "code":
      return <Code className='h-8 w-8 text-indigo-600' />;
    default:
      return <File className='h-8 w-8 text-gray-600' />;
  }
};

export function FileGrid({
  files,
  viewMode,
  onFileClick,
  documentType,
}: FileGridProps) {
  if (viewMode === "grid") {
    return (
      <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8'>
        {files.map((file) => (
          <div
            key={file._id}
            className='group hover:bg-accent relative flex cursor-pointer flex-col items-center rounded-lg border p-3 transition-colors'
            onClick={() => onFileClick?.(file)}
          >
            <div className='relative'>
              {getFileIcon(documentType, file)}
              {file.starred && (
                <Star className='absolute -top-1 -right-1 h-3 w-3 fill-current text-yellow-500' />
              )}
            </div>
            <span className='mt-2 line-clamp-2 max-w-full text-center text-sm break-words'>
              {file.name}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='absolute top-1 right-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100'
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className='h-3 w-3' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem>
                  <Download className='mr-2 h-4 w-4' />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share className='mr-2 h-4 w-4' />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Star className='mr-2 h-4 w-4' />
                  {file.starred ? "Unstar" : "Star"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className='text-destructive'>
                  <Trash2 className='mr-2 h-4 w-4' />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className='space-y-1'>
      {documentType === "folder" && (
        <div className='text-muted-foreground grid grid-cols-12 gap-4 border-b px-4 py-2 text-sm font-medium'>
          <div className='col-span-6'>Name</div>
          <div className='col-span-2'>Size</div>
          <div className='col-span-3'>Modified</div>
          <div className='col-span-1'></div>
        </div>
      )}
      {files.map((file) => (
        <div
          key={file._id}
          className='hover:bg-accent group grid cursor-pointer grid-cols-12 gap-4 rounded-lg px-4 py-2 transition-colors'
          onClick={() => onFileClick?.(file)}
        >
          <div className='col-span-6 flex items-center gap-3'>
            <div className='relative'>
              {getFileIcon(documentType, file)}
              {file.starred && (
                <Star className='absolute -top-1 -right-1 h-3 w-3 fill-current text-yellow-500' />
              )}
            </div>
            <span className='truncate'>{file.name}</span>
          </div>
          <div className='text-muted-foreground col-span-2 flex items-center text-sm'>
            {file.size || "-"}
          </div>
          <div className='text-muted-foreground col-span-3 flex items-center text-sm'>
            {formatDistanceToNow(file.modifiedAt, { addSuffix: true })}
          </div>
          <div className='col-span-1 flex items-center justify-end'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100'
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem>
                  <Download className='mr-2 h-4 w-4' />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share className='mr-2 h-4 w-4' />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Star className='mr-2 h-4 w-4' />
                  {file.starred ? "Unstar" : "Star"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className='text-destructive'>
                  <Trash2 className='mr-2 h-4 w-4' />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  );
}
