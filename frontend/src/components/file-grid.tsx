import {
  Archive,
  Code,
  Download,
  File,
  FileText,
  FileType2,
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

interface FileItem {
  id: string;
  name: string;
  fileType?: "document" | "image" | "video" | "audio" | "other";
  size?: string;
  modifiedAt: Date;
  starred?: boolean;
}

interface FileGridProps {
  files: Array<FileItem>;
  documentType: "folder" | "file";

  viewMode: "grid" | "list";
  onFileClick?: (file: FileItem) => void;
}

function getFileIconName(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "txt":
    case "md":
    case "rtf":
      return "document";

    case "pdf":
      return "pdf";

    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "bmp":
    case "webp":
    case "tiff":
    case "ico":
      return "image";

    case "svg":
      return "vector";

    case "mp4":
    case "mov":
    case "avi":
    case "mkv":
    case "webm":
    case "flv":
      return "video";

    case "mp3":
    case "wav":
    case "ogg":
    case "flac":
      return "audio";

    case "zip":
    case "rar":
    case "7z":
    case "tar":
    case "gz":
    case "bz2":
      return "archive";

    case "xls":
    case "xlsx":
    case "ods":
      return "spreadsheet";

    case "ppt":
    case "pptx":
    case "odp":
      return "presentation";

    case "doc":
    case "docx":
    case "odt":
      return "word";

    case "ttf":
    case "otf":
    case "woff":
    case "woff2":
      return "font";

    case "exe":
    case "msi":
    case "apk":
    case "bat":
    case "sh":
      return "executable";

    case "db":
    case "sqlite":
    case "sql":
      return "database";

    case "js":
    case "jsx":
    case "ts":
    case "tsx":
    case "html":
    case "css":
    case "scss":
    case "py":
    case "java":
    case "c":
    case "cpp":
    case "cs":
    case "rb":
    case "go":
    case "rs":
    case "php":
      return "code";

    default:
      return "alt";
  }
}

const getFileIcon = (document: string, file: FileItem) => {
  if (document === "folder") {
    return <Folder className='h-8 w-8 text-blue-500' />;
  }

  const iconType = getFileIconName(file.name);

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
            key={file.id}
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
      <div className='text-muted-foreground grid grid-cols-12 gap-4 border-b px-4 py-2 text-sm font-medium'>
        <div className='col-span-6'>Name</div>
        <div className='col-span-2'>Size</div>
        <div className='col-span-3'>Modified</div>
        <div className='col-span-1'></div>
      </div>
      {files.map((file) => (
        <div
          key={file.id}
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
