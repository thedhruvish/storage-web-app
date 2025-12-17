import { useEffect } from "react";
import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAppearance } from "@/store/appearance-store";
import { useUser } from "@/store/user-store";
import { useGetCurrentUser } from "@/api/auth";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Dialogs } from "@/components/dialogs";
import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/_authenticated")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user, setUser } = useUser();
  const { appearance } = useAppearance();
  const getCureentUser = useGetCurrentUser();
  const navagate = useNavigate();

  useEffect(() => {
    if (getCureentUser.isSuccess) {
      setUser(getCureentUser.data.data.data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getCureentUser.isSuccess]);

  useEffect(() => {
    if (getCureentUser.isError) {
      navagate({ to: "/login" });
    }
  }, [getCureentUser.isError, getCureentUser.error, navagate]);

  // if (getCureentUser.isLoading || getCureentUser.isFetching) {
  //   return <FileManagerSkeleton />;
  // }

  if (!user) return null;
  return (
    <div className='[--header-height:calc(theme(spacing.14))]'>
      <SidebarProvider
        className='flex flex-col'
        defaultOpen={appearance.sidebar}
      >
        <SiteHeader />
        <div className='flex flex-1'>
          <AppSidebar />
          <SidebarInset className='flex flex-col'>
            <Outlet />
            <Dialogs />
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
