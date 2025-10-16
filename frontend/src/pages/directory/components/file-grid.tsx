import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "@tanstack/react-router";
import { useDialogStore } from "@/store/DialogsStore";
import { motion } from "framer-motion";
import {
  Archive,
  Code,
  Download,
  File,
  FileText,
  Folder,
  FolderPen,
  ImageIcon,
  InfoIcon,
  Music,
  Share,
  Star,
  StarOff,
  Trash2,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { usestarredToggle } from "@/api/directoryApi";
import { getFileIconName } from "@/utils/file-icon-helper";
import { truncateFileName } from "@/utils/truncateFileName";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import type { FileGridProps, FileItem } from "../types";
import FileDropdownMenu from "./file-dropdown-menu";

const getFileIcon = (documentType: string, file: FileItem) => {
  if (documentType === "folder") {
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
  const { setOpen, setCurrentItem } = useDialogStore();
  const starredMutation = usestarredToggle();

  const handleOpenDialog = (
    type: Parameters<typeof setOpen>[0],
    file: FileItem
  ) => {
    setOpen(type);
    setCurrentItem({ ...file, type: file.extension ? "file" : "folder" });
  };

  const handleFileDownload = (file: FileItem) => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/document/${file._id}?action=download`;
  };

  const handleStarredToggle = (file: FileItem) => {
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

  const renderContextMenuItems = (file: FileItem) => (
    <>
      {file.extension && (
        <ContextMenuItem
          onClick={() => handleFileDownload(file)}
          className='cursor-pointer'
        >
          <Download className='mr-2 h-4 w-4' /> Download
        </ContextMenuItem>
      )}
      <ContextMenuItem
        onClick={() => handleOpenDialog("details", file)}
        className='cursor-pointer'
      >
        <InfoIcon className='mr-2 h-4 w-4' /> Details
      </ContextMenuItem>
      <ContextMenuItem
        onClick={() => handleOpenDialog("rename", file)}
        className='cursor-pointer'
      >
        <FolderPen className='mr-2 h-4 w-4' /> Rename
      </ContextMenuItem>
      {documentType === "folder" && (
        <ContextMenuItem
          onClick={() => handleOpenDialog("share", file)}
          className='cursor-pointer'
        >
          <Share className='mr-2 h-4 w-4' /> Share
        </ContextMenuItem>
      )}
      <ContextMenuItem
        onClick={() => handleStarredToggle(file)}
        className='cursor-pointer flex items-center'
      >
        {file.isStarred ? (
          <StarOff className='mr-2 h-4 w-4 text-gray-500' />
        ) : (
          <Star className='mr-2 h-4 w-4 fill-yellow-500 text-yellow-500' />
        )}
        <span>{file.isStarred ? "Unstar" : "Star"}</span>
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem
        className='cursor-pointer text-destructive hover:!bg-destructive/10'
        onClick={() => handleOpenDialog("delete", file)}
      >
        <Trash2 className='mr-2 h-4 w-4' /> Delete
      </ContextMenuItem>
    </>
  );

  if (viewMode === "grid") {
    return (
      <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8'>
        {files.map((file) => (
          <ContextMenu key={file._id}>
            <ContextMenuTrigger>
              <div
                className='group hover:bg-accent relative flex cursor-pointer flex-col items-center rounded-lg border p-3 transition-colors'
                onClick={(e) => {
                  e.stopPropagation();
                  if (documentType === "folder") {
                    navigate({ to: `/directory/${file._id}` });
                  }
                }}
                onDoubleClick={() => {
                  if (documentType !== "folder") {
                    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/document/${file._id}`;
                  }
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
                  className='flex w-full flex-col items-center'
                >
                  <div className='relative'>
                    {getFileIcon(documentType, file)}
                    {file.isStarred && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 15,
                        }}
                        className='absolute -top-1 -right-1'
                      >
                        <Star className='h-3 w-3 fill-current text-yellow-500 drop-shadow-md' />
                      </motion.div>
                    )}
                  </div>
                  {/* --- THIS IS THE MODIFIED LINE --- */}
                  <span className='mt-2 h-10 text-center text-sm break-all line-clamp-2'>
                    {truncateFileName(file.name)}
                  </span>
                </div>
                <FileDropdownMenu
                  file={file}
                  buttonViewType='grid'
                  fileType={documentType}
                />
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent className='w-40 rounded-xl shadow-lg border bg-popover text-sm'>
              {renderContextMenuItems(file)}
            </ContextMenuContent>
          </ContextMenu>
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
        <ContextMenu key={file._id}>
          <ContextMenuTrigger>
            <div className='hover:bg-accent group grid cursor-pointer grid-cols-12 gap-4 rounded-lg px-4 py-2 transition-colors'>
              <div className='col-span-6 flex items-center gap-3'>
                <div className='relative'>
                  {getFileIcon(documentType, file)}
                  {file.isStarred && (
                    <Star className='absolute -top-1 -right-1 h-3 w-3 fill-current text-yellow-500' />
                  )}
                </div>
                <span className='truncate'>{file.name}</span>
              </div>
              <div className='text-muted-foreground col-span-2 flex items-center text-sm'>
                {file.metaData?.size || "-"}
              </div>
              <div className='text-muted-foreground col-span-3 flex items-center text-sm'>
                {formatDistanceToNow(new Date(file.createdAt), {
                  addSuffix: true,
                })}
              </div>
              <div className='col-span-1 flex items-center justify-end'>
                <FileDropdownMenu
                  file={file}
                  buttonViewType='list'
                  fileType={documentType}
                />
              </div>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent className='w-40 rounded-xl shadow-lg border bg-popover text-sm'>
            {renderContextMenuItems(file)}
          </ContextMenuContent>
        </ContextMenu>
      ))}
    </div>
  );
}
