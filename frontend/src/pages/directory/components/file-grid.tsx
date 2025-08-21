import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "@tanstack/react-router";
import {
  Archive,
  Code,
  File,
  FileText,
  Folder,
  ImageIcon,
  Music,
  Star,
  Video,
} from "lucide-react";
import { getFileIconName } from "@/utils/file-icon-helper";
import { truncateFileName } from "@/utils/truncateFileName";
import type { FileGridProps, FileItem } from "../types";
import FileDropdownMenu from "./file-dropdown-menu";

const getFileIcon = (document: string, file: FileItem) => {
  if (document === "folder") {
    return <Folder className='h-8 w-8 text-blue-500' />;
  }
  if (!file.extension) {
    return <File className='h-8 w-8 text-gray-600' />;
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

export function FileGrid({ files, viewMode, documentType }: FileGridProps) {
  const navigate = useNavigate();

  if (viewMode === "grid") {
    return (
      <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8'>
        {files.map((file) => (
          <div
            key={file._id}
            className='group hover:bg-accent relative flex cursor-pointer flex-col items-center rounded-lg border p-3 transition-colors'
            onClick={(e) => {
              e.stopPropagation(); // ensure dropdown clicks don’t bubble
            }}
          >
            <div
              onClick={() => {
                if (documentType === "folder") {
                  navigate({ to: `/directory/${file._id}` });
                } else {
                  window.location.href = `${import.meta.env.VITE_BACKEND_URL}/document/${file._id}`;
                }
              }}
              className='flex flex-col items-center'
            >
              <div className='relative'>
                {getFileIcon(documentType, file)}
                {file.starred && (
                  <Star className='absolute -top-1 -right-1 h-3 w-3 fill-current text-yellow-500' />
                )}
              </div>
              <span className='mt-2 text-center text-sm break-all'>
                {truncateFileName(file.name)}
              </span>
            </div>

            <FileDropdownMenu
              file={file}
              buttonViewType='grid'
              fileType={documentType}
            />
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
            {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}
          </div>
          <div className='col-span-1 flex items-center justify-end'>
            <FileDropdownMenu
              file={file}
              buttonViewType='list'
              fileType={documentType}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
