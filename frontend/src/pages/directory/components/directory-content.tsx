import { useCallback, useEffect, useMemo } from "react";
import { AxiosError } from "axios";
import { useNavigate } from "@tanstack/react-router";
import { useAppearance } from "@/store/appearance-store";
import { useDialogStore } from "@/store/dialogs-store";
import { useDirectoryStore } from "@/store/directory-store";
import { uploadFiles } from "@/store/upload-store";
import { useUser } from "@/store/user-store";
import { UploadCloud } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu";
import { Separator } from "@/components/ui/separator";
import { FileManagerSkeleton } from "@/components/file-manager-skeleton";
import Error404 from "@/components/status-code/404";
import { UploadProgressIndicator } from "@/components/upload-progress-indicator";
import type { FileItem } from "../types";
import { FileGrid } from "./file-grid";
import { FileToolbar } from "./file-toolbar";
import { HomePageContextMenu } from "./home-page-context-menu";

interface DirectoryContentProps {
  files: { directories?: FileItem[]; documents?: FileItem[] };
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  allowedUpload?: boolean;
  emptyMessage?: string;
  directoryId?: string;
  onFileDoubleClick?: (file: FileItem) => void;
  enableContextMenu?: boolean;
  extraToolbarActions?: React.ReactNode;
  isTrash?: boolean;
}

export function DirectoryContent({
  files,
  isLoading,
  isError,
  error,
  allowedUpload = false,
  emptyMessage = "This folder is empty",
  directoryId = "",
  onFileDoubleClick,
  enableContextMenu = true,
  extraToolbarActions,
  isTrash,
}: DirectoryContentProps) {
  const { appearance } = useAppearance();
  const navigate = useNavigate();
  const { selectedFiles, clearSelection } = useDirectoryStore();
  const { setOpen, setCurrentItem: setDialogCurrentItem } = useDialogStore();
  const { user } = useUser();

  // Combine directories and documents
  const allFiles = useMemo(
    () => [...(files?.directories || []), ...(files?.documents || [])],
    [files]
  );

  const isEmpty = !files?.directories?.length && !files?.documents?.length;

  // --- Upload Logic ---
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!allowedUpload) return;
      if (!user) return;

      const totalSize = acceptedFiles.reduce((acc, file) => acc + file.size, 0);
      if (user.totalUsedBytes + totalSize > user.maxStorageBytes) {
        toast.error("You have exceeded your storage limit.");
        return;
      }

      if (acceptedFiles.length > 0) {
        uploadFiles(acceptedFiles, directoryId);
      }
    },
    [directoryId, user, allowedUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    disabled: !allowedUpload,
  });

  // --- Navigation & Interactions ---
  const handleFileDoubleClickDefault = useCallback(
    (file: FileItem) => {
      if (file.extension) {
        // It's a file
        window.location.href = `${import.meta.env.VITE_BACKEND_URL}/document/${file._id}`;
      } else {
        // It's a folder
        navigate({
          to: `/app/directory/$directoryId`,
          params: { directoryId: file._id },
        });
      }
    },
    [navigate]
  );

  const handleFileDoubleClick =
    onFileDoubleClick || handleFileDoubleClickDefault;

  const handleBackgroundClick = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    if (isTrash) return; // Disable shortcuts in trash mode

    const handleKeyDown = (e: KeyboardEvent) => {
      // F2 - Rename (Single selection)
      if (e.key === "F2") {
        if (selectedFiles.size === 1) {
          e.preventDefault();
          const fileId = Array.from(selectedFiles)[0];
          const file = allFiles.find((f) => f._id === fileId);
          if (file) {
            setDialogCurrentItem({
              ...file,
              type: file.extension ? "file" : "folder",
            });
            setOpen("rename");
          }
        }
      }

      // Delete (Any selection)
      if (e.key === "Delete") {
        if (selectedFiles.size > 0) {
          e.preventDefault();
          const fileId = Array.from(selectedFiles)[0];
          const file = allFiles.find((f) => f._id === fileId);
          if (file) {
            setDialogCurrentItem({
              ...file,
              type: file.extension ? "file" : "folder",
            });
            setOpen("delete");
          }
        }
      }

      // Enter - Open/Navigate (Single selection)
      if (e.key === "Enter") {
        if (selectedFiles.size === 1) {
          e.preventDefault();
          const fileId = Array.from(selectedFiles)[0];
          const file = allFiles.find((f) => f._id === fileId);
          if (file) {
            handleFileDoubleClick(file);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedFiles,
    allFiles,
    setDialogCurrentItem,
    setOpen,
    handleFileDoubleClick,
    isTrash,
  ]);

  const content = (
    <div className='p-4 pb-20 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300'>
      {files.directories && files.directories.length > 0 && (
        <FileGrid
          files={files.directories}
          documentType='folder'
          viewMode={appearance.directoryLayout}
          onFileDoubleClick={handleFileDoubleClick}
        />
      )}

      {files.directories &&
        files.directories.length > 0 &&
        files.documents &&
        files.documents.length > 0 && <Separator className='bg-border' />}

      {files.documents && files.documents.length > 0 && (
        <FileGrid
          files={files.documents}
          documentType='file'
          viewMode={appearance.directoryLayout}
          onFileDoubleClick={handleFileDoubleClick}
        />
      )}
    </div>
  );

  return (
    <div
      {...(allowedUpload ? getRootProps() : {})}
      onClick={handleBackgroundClick}
      className='bg-background flex h-full flex-col outline-none overflow-hidden'
    >
      {allowedUpload && <input {...getInputProps()} />}

      <div className='flex-none z-10'>
        <FileToolbar
          viewMode={appearance.directoryLayout}
          allFiles={allFiles}
          hideActions={!allowedUpload}
          extraActions={extraToolbarActions}
          isTrash={isTrash}
        />
      </div>

      <div className='flex-1 relative overflow-y-auto'>
        {/* Drag Drop Overlay */}
        {allowedUpload && isDragActive && (
          <div className='bg-primary/5 border-primary absolute inset-4 z-50 flex flex-col items-center justify-center rounded-xl border-2 border-dashed backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200'>
            <UploadCloud className='text-primary size-16 mb-4' />
            <p className='text-primary text-xl font-semibold'>
              Drop files to upload
            </p>
          </div>
        )}

        {/* Content Rendering */}
        {isLoading ? (
          <div className='p-4'>
            <FileManagerSkeleton />
          </div>
        ) : isError ? (
          (error as AxiosError)?.response?.status === 404 ? (
            <Error404 errorTitle='Directory Not Found' />
          ) : (
            <div className='flex h-full items-center justify-center text-destructive animate-in fade-in'>
              <p>Error loading content.</p>
            </div>
          )
        ) : isEmpty ? (
          <div className='flex h-full flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300'>
            <div className='bg-muted rounded-full p-6 mb-4'>
              <UploadCloud className='text-muted-foreground size-10' />
            </div>
            <div className='text-2xl text-muted-foreground font-medium'>
              {emptyMessage}
            </div>
          </div>
        ) : enableContextMenu ? (
          <ContextMenu>
            <ContextMenuTrigger asChild>{content}</ContextMenuTrigger>
            {allowedUpload && <HomePageContextMenu />}
          </ContextMenu>
        ) : (
          content
        )}
      </div>

      {allowedUpload && <UploadProgressIndicator />}
    </div>
  );
}
