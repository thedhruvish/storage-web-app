import { Link } from "@tanstack/react-router";
import { useBreadCrumStore } from "@/store/breadCrum-store";
import { useUser } from "@/store/user-store";
import { SidebarIcon, MoreHorizontal } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchForm } from "@/components/search-form";
import { ModeToggle } from "./theme-toggle";
import { UserNav } from "./user-nav";

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();
  const { user } = useUser();
  const { path: BreadCrumData, status, currentItemName } = useBreadCrumStore();

  if (!user) return null;

  const shouldCollapse = BreadCrumData.length > 3;
  const lastTwo = BreadCrumData.slice(-2);
  const hiddenItems = BreadCrumData.slice(0, -2);
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
              <BreadcrumbLink to='/'>Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {status === "loading" ? (
              <>
                <Skeleton className='h-6 w-40 rounded-md' />
              </>
            ) : (
              <>
                {!shouldCollapse ? (
                  BreadCrumData.map((item, i) => (
                    <div key={item._id} className='flex items-center'>
                      <BreadcrumbItem>
                        <BreadcrumbLink to={`/directory/${item._id}`}>
                          {item.name}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      {i <= BreadCrumData.length - 1 && <BreadcrumbSeparator />}
                    </div>
                  ))
                ) : (
                  <>
                    <BreadcrumbItem>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-6 w-6 p-0'
                          >
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='start'>
                          {hiddenItems.map((item) => (
                            <DropdownMenuItem key={item._id} asChild>
                              <Link
                                to={"/directory/$directoryId"}
                                params={{ directoryId: item._id }}
                              >
                                {item.name}
                              </Link>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />

                    {lastTwo.map((item, i) => (
                      <div key={item._id} className='flex items-center'>
                        <BreadcrumbItem>
                          <BreadcrumbLink to={`/directory/${item._id}`}>
                            {item.name}
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                        {i < lastTwo.length - 1 && <BreadcrumbSeparator />}
                      </div>
                    ))}
                  </>
                )}
                {currentItemName && (
                  <>
                    <BreadcrumbItem>
                      <BreadcrumbPage>{currentItemName}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>

        <SearchForm className='w-full sm:ml-auto sm:w-auto' />
        <ModeToggle />
        <UserNav user={user} />
      </div>
    </header>
  );
}
