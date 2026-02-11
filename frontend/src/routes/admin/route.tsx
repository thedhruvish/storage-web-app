import { useEffect } from "react";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useAppearance } from "@/store/appearance-store";
import { useUser } from "@/store/user-store";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Dialogs } from "@/components/dialogs";
import { SiteHeader } from "@/components/site-header";
import Error403 from "@/components/status-code/403";

export const Route = createFileRoute("/admin")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = useUser();
  const navagate = useNavigate();
  const { appearance } = useAppearance();

  useEffect(() => {
    if (!user) {
      navagate({ to: "/auth/login" });
    }
  }, [user, navagate]);

  if (!user || !["admin", "owner"].includes(user?.role))
    return <Error403 errorTitle="You can't access this resource" />;

  return (
    <div className='[--header-height:calc(--spacing(14))]'>
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
