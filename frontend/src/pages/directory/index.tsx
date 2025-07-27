import { toast } from "sonner";
import { FileGrid } from "@/pages/directory/components/file-grid";
import { FileToolbar } from "@/pages/directory/components/file-toolbar";
import { Separator } from "@/components/ui/separator";
import { useGetAllDirectoryList } from "@/api/directoryApi";
import { FileManagerSkeleton } from "@/components/FileManagerSkeleton";
import { useAppearance } from "@/store/appearanceStore";

export default function Home({ directoryId = "" }: { directoryId?: string }) {
  const { appearance } = useAppearance();

  const getDirectoryDataHook = useGetAllDirectoryList(directoryId);

  const handleFileClick = (file: any) => {
    toast("Event has been created");
    // Handle file/folder opening logic here
  };
  if (!getDirectoryDataHook.isSuccess) {
    return <FileManagerSkeleton />;
  }
  return (
    <>
      <FileToolbar viewMode={appearance.directoryLayout} />
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
    </>
  );
}
