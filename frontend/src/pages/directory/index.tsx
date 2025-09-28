import { FileGrid } from "@/pages/directory/components/file-grid";
import { FileToolbar } from "@/pages/directory/components/file-toolbar";
import { useAppearance } from "@/store/appearanceStore";
import { useGetAllDirectoryList } from "@/api/directoryApi";
import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu";
import { Separator } from "@/components/ui/separator";
import { FileManagerSkeleton } from "@/components/FileManagerSkeleton";
import { HomePageContextMenu } from "./components/HomePageContextMenu";

export default function Home({ directoryId = "" }: { directoryId?: string }) {
  const { appearance } = useAppearance();
  const getDirectoryDataHook = useGetAllDirectoryList(directoryId);

  if (!getDirectoryDataHook.isSuccess) {
    return <FileManagerSkeleton />;
  }

  return (
    <>
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
            <div className='flex-1 p-4'>
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
    </>
  );
}
