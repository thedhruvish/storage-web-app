import { FileGrid } from "@/pages/directory/components/file-grid";
import { FileToolbar } from "@/pages/directory/components/file-toolbar";
import { useAppearance } from "@/store/appearanceStore";
import { toast } from "sonner";
import { useGetAllDirectoryList } from "@/api/directoryApi";
import { Separator } from "@/components/ui/separator";
import { FileManagerSkeleton } from "@/components/FileManagerSkeleton";

export default function Home({ directoryId = "" }: { directoryId?: string }) {
  const { appearance } = useAppearance();

  const getDirectoryDataHook = useGetAllDirectoryList(directoryId);

  const handleFileClick = () => {
    toast("Event has been created");
    // Handle file/folder opening logic here
  };
  if (!getDirectoryDataHook.isSuccess) {
    return <FileManagerSkeleton />;
  }
  return (
    <>
      <FileToolbar viewMode={appearance.directoryLayout} />
      {getDirectoryDataHook.data?.data.directories.length === 0 &&
      getDirectoryDataHook.data?.data.documents.length === 0 ? (
        <div className='flex h-screen items-center justify-center'>
          <div className='text-2xl'>File is empty</div>
        </div>
      ) : (
        <div className='flex-1 p-4'>
          <FileGrid
            files={getDirectoryDataHook.data?.data.directories || []}
            documentType='folder'
            viewMode={appearance.directoryLayout}
            onFileClick={handleFileClick}
          />
          <Separator className='my-4 w-6' />
          <FileGrid
            files={getDirectoryDataHook.data?.data.documents || []}
            documentType='file'
            viewMode={appearance.directoryLayout}
            onFileClick={handleFileClick}
          />
        </div>
      )}
    </>
  );
}
