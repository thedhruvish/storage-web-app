import * as React from "react";
import { Link } from "@tanstack/react-router";
import { useDialogStore } from "@/store/DialogsStore";
import { useUser } from "@/store/userStore";
import {
  Clock,
  Command,
  HardDrive,
  Plane,
  Plus,
  Star,
  Trash2,
  Upload,
  User,
  Users,
} from "lucide-react";
import { useFileUploader } from "@/hooks/use-file-uploader";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/nav-user";
import { StorageProgress } from "./storage-progress";
import { Button } from "./ui/button";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser();
  const { setOpen } = useDialogStore();
  const { triggerUploader, UploaderInput } = useFileUploader();

  if (!user) {
    return null;
  }
  return (
    <Sidebar
      className='top-(--header-height) h-[calc(100svh-var(--header-height))]!'
      {...props}
    >
      {UploaderInput}
      <SidebarHeader className='border-b'>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' asChild>
              <a href='#' className='flex items-center gap-3'>
                <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white'>
                  <Command className='size-4' />
                </div>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-semibold'>Drive Clone</span>
                  <span className='text-muted-foreground truncate text-xs'>
                    File Storage
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {/* Quick Actions */}
        <div className='flex gap-2 px-2 pb-2'>
          <Button
            size='sm'
            className='flex-1'
            onClick={() => setOpen("newDirectory")}
          >
            <Plus className='mr-2 h-4 w-4' />
            New Folder
          </Button>
          <Button
            size='sm'
            variant='outline'
            className='flex-1 bg-transparent'
            onClick={triggerUploader}
          >
            <Upload className='mr-2 h-4 w-4' />
            Upload
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarGroupLabel>My Drive</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to='/directory' className='flex items-center gap-3'>
                    <HardDrive className='h-4 w-4' />
                    <span>My Drive</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to='/' className='flex items-center gap-3'>
                    <Users className='h-4 w-4' />
                    <span>Shared with me</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to='/' className='flex items-center gap-3'>
                    <Clock className='h-4 w-4' />
                    <span>Recent</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to='/' className='flex items-center gap-3'>
                    <Star className='h-4 w-4' />
                    <span>Starred</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to='/' className='flex items-center gap-3'>
                    <Trash2 className='h-4 w-4' />
                    <span>Trash</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            {["owner", "admin", "manager"].includes(user.role) && (
              <>
                <SidebarGroupLabel>Admin</SidebarGroupLabel>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to='/admin' className='flex items-center gap-3'>
                        <User className='h-4 w-4' />
                        <span>All Users</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link
                        to='/admin/plan'
                        className='flex items-center gap-3'
                      >
                        <Plane className='h-4 w-4' />
                        <span>All Plan</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <StorageProgress
          totalUsedBytes={user.totalUsedBytes}
          maxStorageBytes={user.maxStorageBytes}
        />
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
