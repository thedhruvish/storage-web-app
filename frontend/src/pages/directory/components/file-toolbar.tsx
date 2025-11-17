import { useDialogStore } from "@/store/DialogsStore";
import { useAppearance } from "@/store/appearanceStore";
import {
  Filter,
  FolderPlus,
  Grid3X3,
  Import,
  List,
  Plus,
  SortAsc,
  Upload,
} from "lucide-react";
import { checkConnectedGoogle } from "@/api/importDataApi";
import { useDrivePicker } from "@/hooks/drive-picker";
import { useFileUploader } from "@/hooks/use-file-uploader";
import { useStorageStatus } from "@/hooks/use-storage-status";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FileToolbarProps {
  viewMode: "grid" | "list";
}

export function FileToolbar({ viewMode }: FileToolbarProps) {
  const { openPicker } = useDrivePicker();
  const { setOpen } = useDialogStore();
  const { setAppearance } = useAppearance();

  const { isUploadDisabled, storageTooltipMessage } = useStorageStatus();

  const { triggerUploader, UploaderInput } = useFileUploader();

  const { refetch: refetchGoogleConnection, isFetching } = checkConnectedGoogle(
    { enabled: false }
  );

  const importFromGoogleDrive = async () => {
    const { data } = await refetchGoogleConnection();
    if (data?.data?.is_connected) {
      openPicker();
    } else {
      setOpen("importFile");
    }
  };

  return (
    <>
      {UploaderInput}

      <div className='flex flex-wrap items-center justify-between gap-2 border-b p-4 '>
        <div className='flex flex-wrap items-center gap-2'>
          <div className='flex sm:hidden cursor-not-allowed'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Plus className='mr-2 h-4 w-4' />
                  New
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='start'>
                <DropdownMenuItem onClick={() => setOpen("newDirectory")}>
                  <FolderPlus className='mr-2 h-4 w-4' />
                  New Folder
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={triggerUploader}
                  disabled={isUploadDisabled}
                >
                  <Upload className='mr-2 h-4 w-4' />
                  File Upload
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={isUploadDisabled || isFetching}
                  onClick={importFromGoogleDrive}
                >
                  <Import className='mr-2 h-4 w-4' />
                  {isFetching ? "Checking..." : "Import"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {/* Desktop: Full buttons */}
          <div className='hidden items-center gap-2 sm:flex cursor-not-allowed'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Plus className='mr-2 h-4 w-4' />
                  New
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='start'>
                <DropdownMenuItem onClick={() => setOpen("newDirectory")}>
                  <FolderPlus className='mr-2 h-4 w-4' />
                  New Folder
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={triggerUploader}
                  disabled={isUploadDisabled} // Disable based on storage
                >
                  <Upload className='mr-2 h-4 w-4' />
                  File Upload
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0}>
                    <Button
                      variant='outline'
                      onClick={triggerUploader}
                      disabled={isUploadDisabled}
                    >
                      <Upload className='mr-2 h-4 w-4' />
                      <span className='hidden md:inline'>Upload</span>
                    </Button>
                  </span>
                </TooltipTrigger>
                {isUploadDisabled && (
                  <TooltipContent>{storageTooltipMessage}</TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0}>
                    <Button
                      variant='outline'
                      disabled={isUploadDisabled || isFetching}
                      onClick={importFromGoogleDrive}
                    >
                      <Import className='mr-2 h-4 w-4' />
                      <span className='hidden md:inline'>
                        {isFetching ? "Checking..." : "Import"}
                      </span>
                    </Button>
                  </span>
                </TooltipTrigger>
                {isUploadDisabled && (
                  <TooltipContent>{storageTooltipMessage}</TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <Button variant='outline' size='icon'>
            <SortAsc className='h-4 w-4' />
          </Button>

          <Button variant='outline' size='icon'>
            <Filter className='h-4 w-4' />
          </Button>

          <Separator orientation='vertical' className='hidden h-6 sm:block' />

          <div className='flex items-center rounded-md border'>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size='icon'
              className='rounded-r-none'
              onClick={() => setAppearance({ directoryLayout: "grid" })}
            >
              <Grid3X3 className='h-4 w-4' />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size='icon'
              className='rounded-l-none'
              onClick={() => setAppearance({ directoryLayout: "list" })}
            >
              <List className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
