import * as React from "react";
import { toast } from "sonner";
import DashboardProvider from "./context/dashboard-context";
import { UsersDialogs } from "./components/dashboard-dialogs";
import { FileGrid } from "@/pages/dashboard/components/file-grid";
import { FileToolbar } from "@/pages/dashboard/components/file-toolbar";
import { Separator } from "@/components/ui/separator";
import { useGetAllDirectoryList } from "@/api/directoryApi";
import { FileManagerSkeleton } from "@/components/FileManagerSkeleton";

export default function Home() {
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [folderData, setFolderData] = React.useState([]);
  const [fileData, setFileData] = React.useState([]);

  const getDirectoryDataHook = useGetAllDirectoryList();
  React.useEffect(() => {
    if (getDirectoryDataHook.isSuccess) {
      console.log(getDirectoryDataHook.data);
      setFolderData(getDirectoryDataHook.data.data.directories);
      setFileData(getDirectoryDataHook.data.data.documents);
    }
  }, [getDirectoryDataHook.isSuccess]);

  const handleFileClick = (file: any) => {
    console.log("File clicked:", file);
    toast("Event has been created");
    // Handle file/folder opening logic here
  };
  if (!getDirectoryDataHook.isSuccess) {
    return <FileManagerSkeleton />;
  }
  return (
    <DashboardProvider>
      <FileToolbar viewMode={viewMode} onViewModeChange={setViewMode} />
      <div className='flex-1 p-4'>
        <FileGrid
          files={folderData}
          documentType='folder'
          viewMode={viewMode}
          onFileClick={handleFileClick}
        />
        <Separator className='my-4 w-6' />
        <FileGrid
          files={fileData}
          documentType='file'
          viewMode={viewMode}
          onFileClick={handleFileClick}
        />
      </div>
      <UsersDialogs />
    </DashboardProvider>
  );
}
