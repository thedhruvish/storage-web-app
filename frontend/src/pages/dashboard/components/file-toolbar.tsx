"use client";

import {
  Filter,
  FolderPlus,
  Grid3X3,
  List,
  Plus,
  SortAsc,
  Upload,
} from "lucide-react";

import { useDashboard } from "../context/dashboard-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useAppearance } from "@/store/appearanceStore";

interface FileToolbarProps {
  viewMode: "grid" | "list";
}

export function FileToolbar({ viewMode }: FileToolbarProps) {
  const { setOpen } = useDashboard();
  const { setAppearance } = useAppearance();

  return (
    <div className='flex items-center justify-between border-b p-4'>
      <div className='flex items-center gap-2'>
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
          Upload
        </Button>
      </div>

      <div className='flex items-center gap-2'>
        <Button variant='outline' size='icon'>
          <SortAsc className='h-4 w-4' />
        </Button>

        <Button variant='outline' size='icon'>
          <Filter className='h-4 w-4' />
        </Button>

        <Separator orientation='vertical' className='h-6' />

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
