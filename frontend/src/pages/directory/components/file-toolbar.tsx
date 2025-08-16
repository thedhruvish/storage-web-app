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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

interface FileToolbarProps {
  viewMode: "grid" | "list";
}

export function FileToolbar({ viewMode }: FileToolbarProps) {
  const { setOpen } = useDialogStore();
  const { setAppearance } = useAppearance();

  return (
    <div className='flex flex-wrap items-center justify-between gap-2 border-b p-4'>
      {/* Left: New / Upload / Import */}
      <div className='flex flex-wrap items-center gap-2'>
        {/* Mobile: Collapse into single "New" dropdown */}
        <div className='flex sm:hidden'>
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
              <DropdownMenuItem onClick={() => setOpen("uploadFile")}>
                <Upload className='mr-2 h-4 w-4' />
                File Upload
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setOpen("importFile")}>
                <Import className='mr-2 h-4 w-4' />
                Import
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Desktop: Full buttons */}
        <div className='hidden items-center gap-2 sm:flex'>
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
              <DropdownMenuItem onClick={() => setOpen("uploadFile")}>
                <Upload className='mr-2 h-4 w-4' />
                File Upload
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant='outline' onClick={() => setOpen("uploadFile")}>
            <Upload className='mr-2 h-4 w-4' />
            <span className='hidden md:inline'>Upload</span>
          </Button>

          <Button variant='outline' onClick={() => setOpen("importFile")}>
            <Import className='mr-2 h-4 w-4' />
            <span className='hidden md:inline'>Import</span>
          </Button>
        </div>
      </div>

      {/* Right: Sort / Filter / View Toggle */}
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
  );
}
