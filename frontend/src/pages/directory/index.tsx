import { useCallback } from "react";
import { useParams } from "@tanstack/react-router";
import { FileGrid } from "@/pages/directory/components/file-grid";
import { FileToolbar } from "@/pages/directory/components/file-toolbar";
import { useAppearance } from "@/store/appearanceStore";
import { useUploadStore } from "@/store/uploadStore";
import { UploadCloud } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useGetAllDirectoryList } from "@/api/directoryApi";
import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu";
import { Separator } from "@/components/ui/separator";
import { FileManagerSkeleton } from "@/components/FileManagerSkeleton";
import { UploadProgressIndicator } from "@/components/upload-progress-indicator";
import { HomePageContextMenu } from "./components/home-page-context-menu";

export default function Home({
  directoryId: propDirectoryId = "",
}: {
  directoryId?: string;
}) {
  const { appearance } = useAppearance();
  const params = useParams({ strict: false });
  const directoryId =
    (params as { directoryId?: string }).directoryId || propDirectoryId;

  const getDirectoryDataHook = useGetAllDirectoryList(directoryId);
  const { addFiles } = useUploadStore();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        addFiles(acceptedFiles, directoryId);
      }
    },
    [addFiles, directoryId]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
  });

  if (!getDirectoryDataHook.isSuccess) {
    return <FileManagerSkeleton />;
  }

  return (
    <div {...getRootProps()} className='flex h-full flex-col outline-none'>
      <input {...getInputProps()} />
      <FileToolbar viewMode={appearance.directoryLayout} />

      {getDirectoryDataHook.data?.data.directories.length === 0 &&
      getDirectoryDataHook.data?.data.documents.length === 0 ? (
        <div className='flex h-full flex-1 items-center justify-center'>
          <div className='text-2xl text-muted-foreground'>
            This folder is empty
          </div>
        </div>
      ) : (
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div className='flex-1 p-4 relative'>
              {isDragActive && (
                <div className='absolute inset-0 z-20 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-primary bg-primary/10'>
                  <UploadCloud className='h-12 w-12 text-primary' />
                  <p className='mt-2 text-lg font-semibold text-primary'>
                    Drop files to upload
                  </p>
                </div>
              )}
              <FileGrid
                files={getDirectoryDataHook.data?.data.directories || []}
                documentType='folder'
                viewMode={appearance.directoryLayout}
              />
              <Separator className='my-4' />
              <FileGrid
                files={getDirectoryDataHook.data?.data.documents || []}
                documentType='file'
                viewMode={appearance.directoryLayout}
              />
            </div>
          </ContextMenuTrigger>
          <HomePageContextMenu />
        </ContextMenu>
      )}

      <UploadProgressIndicator />
    </div>
  );
}
