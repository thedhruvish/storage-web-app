import { SidebarIcon } from "lucide-react";
import { ModeToggle } from "./theme-toggle";
import { UserNav } from "./user-nav";
import { SearchForm } from "@/components/search-form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";
import { useUser } from "@/store/userStore";

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();
  const { user } = useUser();
  if (!user) {
    return null;
  }

  return (
    <header className='bg-background sticky top-0 z-50 flex w-full items-center border-b'>
      <div className='flex h-(--header-height) w-full items-center gap-2 px-4'>
        <Button
          className='h-8 w-8'
          variant='ghost'
          size='icon'
          onClick={toggleSidebar}
        >
          <SidebarIcon />
        </Button>
        <Separator orientation='vertical' className='mr-2 h-4' />
        <Breadcrumb className='hidden sm:block'>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href='#'>Storage Application</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </BreadcrumbList>
        </Breadcrumb>
        <SearchForm className='w-full sm:ml-auto sm:w-auto' />
        <ModeToggle />
        <UserNav user={user} />
      </div>
    </header>
  );
}
