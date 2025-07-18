import * as React from "react";
import { toast } from "sonner";
import { FileGrid } from "@/components/file-grid";
import { FileToolbar } from "@/components/file-toolbar";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/components/theme-provider";

// Mock data
const mockFiles = [
  {
    id: "1",
    name: "Project Report.pdf",
    size: "2.4 MB",
    modifiedAt: new Date("2024-01-12"),
    starred: true,
  },
  {
    id: "2",
    name: "Vacation Photo.jpg",
    size: "1.8 MB",
    modifiedAt: new Date("2024-01-08"),
  },
  {
    id: "3",
    name: "Presentation.pptx",
    size: "5.2 MB",
    modifiedAt: new Date("2024-01-14"),
  },

  {
    id: "4",
    name: "Demo Video.mp4",
    size: "15.6 MB",
    modifiedAt: new Date("2024-01-11"),
  },
  {
    id: "5",
    name: "Song.mp3",
    size: "4.2 MB",
    modifiedAt: new Date("2024-01-09"),
  },
];

// folder
const folderData = [
  {
    id: "1",
    name: "Documents",
    modifiedAt: new Date("2024-01-15"),
    starred: true,
  },
  {
    id: "2",
    name: "Photos",
    modifiedAt: new Date("2024-01-10"),
  },
  {
    id: "3",
    name: "Music Collection",
    modifiedAt: new Date("2024-01-05"),
  },
];

export default function Home() {
  const { theme = "system" } = useTheme();
  React.useEffect(() => {
    console.log(theme);
  }, [theme]);
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");

  const handleFileClick = (file: any) => {
    console.log("File clicked:", file);
    toast("Event has been created");
    // Handle file/folder opening logic here
  };

  return (
    <>
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
          files={mockFiles}
          documentType='file'
          viewMode={viewMode}
          onFileClick={handleFileClick}
        />
      </div>
    </>
  );
}
