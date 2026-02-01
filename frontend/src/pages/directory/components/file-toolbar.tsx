import type { FileItem } from "@/pages/directory/types";
import { useAppearance } from "@/store/appearance-store";
import { useDialogStore } from "@/store/dialogs-store";
import { useDirectoryStore } from "@/store/directory-store";
import {
  Download,
  Filter,
  FolderPlus,
  Grid3X3,
  Import,
  List,
  Pencil,
  Plus,
  RotateCcw,
  Share,
  SortAsc,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useHardDelete, useRestore } from "@/api/directory-api";
import { checkConnectedGoogle } from "@/api/import-data-api";
import { useDrivePicker } from "@/hooks/use-drive-picker";
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
  allFiles: FileItem[];
  hideActions?: boolean;
  extraActions?: React.ReactNode;
  isTrash?: boolean;
}

export function FileToolbar({
  viewMode,
  allFiles,
  hideActions = false,
  extraActions,
  isTrash = false,
}: FileToolbarProps) {
  const { selectedFiles, clearSelection } = useDirectoryStore();
  const selectedItems = allFiles.filter((f) => selectedFiles.has(f._id));
  const { openPicker, pickerOpened, pickerRef, accessToken } = useDrivePicker();
  const { setOpen, setCurrentItem } = useDialogStore();
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

  const handleAction = (action: string) => {
    if (!selectedItems.length) return;
    const file = selectedItems[0];
    setCurrentItem({ ...file, type: file.extension ? "file" : "folder" });
    setOpen(action as any);
  };

  const handleDownload = () => {
    selectedItems.forEach((file) => {
      if (file.extension) {
        window.location.href = `${import.meta.env.VITE_BACKEND_URL}/document/${file._id}?action=download`;
      }
    });
  };

  /* import RotateCcw, toast, useRestore, useHardDelete */

  const restoreMutation = useRestore();
  const hardDeleteMutation = useHardDelete();

  const handleRestoreSelected = () => {
    selectedItems.forEach((file) => {
      restoreMutation.mutate(
        {
          id: file._id,
          type: file.extension ? "document" : "directory",
        },
        {
          onSuccess: () => {
            toast.success("Restored"); // frequent toasts annoying?
          },
        }
      );
    });
    toast.success("Restore started");
    clearSelection();
  };

  const handleDeleteForeverSelected = async () => {
    selectedItems.forEach((file) => {
      hardDeleteMutation.mutate({
        id: file._id,
        type: file.extension ? "document" : "directory",
      });
    });
    toast.success("Deleting started");
    clearSelection();
  };

  if (selectedItems.length > 0) {
    if (isTrash) {
      return (
        <div className='flex items-center justify-between gap-2 border-b p-4 bg-primary/5 animate-in fade-in slide-in-from-top-2 duration-200'>
          <div className='flex items-center gap-4'>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={clearSelection}
            >
              <X className='h-4 w-4' />
            </Button>
            <span className='font-medium text-sm'>
              {selectedItems.length} selected
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <Button variant='ghost' size='sm' onClick={handleRestoreSelected}>
              <RotateCcw className='mr-2 h-4 w-4' />
              Restore
            </Button>
            <Button
              variant='ghost'
              size='sm'
              className='text-destructive hover:bg-destructive/10'
              onClick={handleDeleteForeverSelected}
            >
              <Trash2 className='mr-2 h-4 w-4' />
              Delete Forever
            </Button>
            {extraActions}
          </div>
        </div>
      );
    }
    return (
      <div className='flex items-center justify-between gap-2 border-b p-4 bg-primary/5 animate-in fade-in slide-in-from-top-2 duration-200'>
        <div className='flex items-center gap-4'>
          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8'
            onClick={clearSelection}
          >
            <X className='h-4 w-4' />
          </Button>
          <span className='font-medium text-sm'>
            {selectedItems.length} selected
          </span>
        </div>

        <div className='flex items-center gap-2'>
          {selectedItems.length === 1 && (
            <>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => handleAction("share")}
              >
                <Share className='mr-2 h-4 w-4' />
                Share
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => handleAction("rename")}
              >
                <Pencil className='mr-2 h-4 w-4' />
                Rename
              </Button>
            </>
          )}

          <Button variant='ghost' size='sm' onClick={handleDownload}>
            <Download className='mr-2 h-4 w-4' />
            Download
          </Button>

          <Button
            variant='ghost'
            size='sm'
            className='text-destructive hover:bg-destructive/10'
            onClick={() => handleAction("delete")}
          >
            <Trash2 className='mr-2 h-4 w-4' />
            Delete
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {!hideActions && UploaderInput}
      {!hideActions && pickerOpened && accessToken ? (
        <drive-picker
          ref={pickerRef}
          multiselect={true}
          oauth-token={accessToken}
          title='Select a folder or file to Import'
          select-folders='true'
        >
          <drive-picker-docs-view
            include-folders='true'
            parent='root'
            select-folder-enabled='true'
          ></drive-picker-docs-view>
        </drive-picker>
      ) : null}

      <div className='flex flex-wrap items-center justify-between gap-2 border-b p-4 '>
        <div className='flex flex-wrap items-center gap-2'>
          {extraActions}
          {!hideActions && (
            <>
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
                          disabled={
                            pickerOpened || isUploadDisabled || isFetching
                          }
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
            </>
          )}
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
