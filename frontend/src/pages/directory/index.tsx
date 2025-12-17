import { useCallback, useEffect } from "react";
import { useParams } from "@tanstack/react-router";
import { FileGrid } from "@/pages/directory/components/file-grid";
import { FileToolbar } from "@/pages/directory/components/file-toolbar";
import { useAppearance } from "@/store/appearance-store";
import { useBreadCrumStore } from "@/store/breadCrum-store";
import { uploadFiles } from "@/store/upload-store";
import { useUser } from "@/store/user-store";
import { UploadCloud } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { useGetAllDirectoryList } from "@/api/directory-api";
import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu";
import { Separator } from "@/components/ui/separator";
import { FileManagerSkeleton } from "@/components/file-manager-skeleton";
import { UploadProgressIndicator } from "@/components/upload-progress-indicator";
import { HomePageContextMenu } from "./components/home-page-context-menu";

export default function Home({
  directoryId: propDirectoryId = "",
}: {
  directoryId?: string;
}) {
  const { appearance } = useAppearance();
  const { setStatus, setPath, setCurrentItem } = useBreadCrumStore();
  const params = useParams({ strict: false });
  const directoryId =
    (params as { directoryId?: string }).directoryId || propDirectoryId;

  // Destructure for cleaner access
  const { data, isLoading, isError, isSuccess } =
    useGetAllDirectoryList(directoryId);

  const { user } = useUser();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
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
    [directoryId, user]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
  });

  // Handle Side Effects (Breadcrumbs)
  useEffect(() => {
    if (isLoading) setStatus("loading");
    else if (isError) setStatus("error");
    else if (isSuccess && data) {
      setStatus("success");
      const { path } = data.data.path;
      setPath(path.slice(1));
      const currentName = data.data.path.name;
      if (currentName.startsWith("root")) {
        setCurrentItem(null);
      } else {
        setCurrentItem(currentName);
      }
    }
  }, [isLoading, isError, isSuccess, data, setPath, setCurrentItem, setStatus]);

  // Extract data safely
  const { directories, documents } = data?.data || {};
  const isEmpty = !directories?.length && !documents?.length;

  return (
    <div
      {...getRootProps()}
      className='bg-background flex h-full flex-col outline-none overflow-hidden'
    >
      <input {...getInputProps()} />

      <div className='flex-none z-10'>
        <FileToolbar viewMode={appearance.directoryLayout} />
      </div>

      <div className='flex-1 relative overflow-y-auto'>
        {/* Drag Drop Overlay */}
        {isDragActive && (
          <div className='bg-primary/5 border-primary absolute inset-4 z-50 flex flex-col items-center justify-center rounded-xl border-2 border-dashed backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200'>
            <UploadCloud className='text-primary size-16 mb-4' />
            <p className='text-primary text-xl font-semibold'>
              Drop files to upload
            </p>
          </div>
        )}

        {/* Conditional Rendering */}
        {isLoading ? (
          <div className='p-4'>
            <FileManagerSkeleton />
          </div>
        ) : isError ? (
          <div className='flex h-full items-center justify-center text-destructive animate-in fade-in'>
            <p>Error loading directory content.</p>
          </div>
        ) : isEmpty ? (
          <div className='flex h-full flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300'>
            <div className='bg-muted rounded-full p-6 mb-4'>
              <UploadCloud className='text-muted-foreground size-10' />
            </div>
            <div className='text-2xl text-muted-foreground font-medium'>
              This folder is empty
            </div>
          </div>
        ) : (
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <div className='p-4 pb-20 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300'>
                {directories?.length > 0 && (
                  <FileGrid
                    files={directories}
                    documentType='folder'
                    viewMode={appearance.directoryLayout}
                  />
                )}

                {directories?.length > 0 && documents?.length > 0 && (
                  <Separator className='bg-border' />
                )}

                {documents?.length > 0 && (
                  <FileGrid
                    files={documents}
                    documentType='file'
                    viewMode={appearance.directoryLayout}
                  />
                )}
              </div>
            </ContextMenuTrigger>
            <HomePageContextMenu />
          </ContextMenu>
        )}
      </div>

      <UploadProgressIndicator />
    </div>
  );
}
