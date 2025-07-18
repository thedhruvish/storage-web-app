import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useUser } from "@/store/userStore";
import { useGetCurrentUser } from "@/api/auth";

export const Route = createFileRoute("/_authenticated")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user, setUser } = useUser();
  // const getCureentUser = useGetCurrentUser();
  const navagate = useNavigate();
  if (!user) {
    setUser({
      _id: "123",
      email: "G5f8D@example.com",
      role: "admin",
      profile: "",
    });
  }
  console.log("run");

  // useEffect(() => {
  //   if (getCureentUser.isSuccess) {
  //     setUser(getCureentUser.data.data);
  //   }
  // }, [getCureentUser.isSuccess, getCureentUser.data, setUser]);
  // console.log(getCureentUser.error);
  // useEffect(() => {
  //   if (getCureentUser.isError) {
  //     console.log("first");
  //     toast.error("Unauthorized");
  //     navagate({ to: "/login" });
  //   }
  // }, [getCureentUser.isError, getCureentUser.error, navagate]);

  // if (getCureentUser.isLoading || getCureentUser.isFetching) {
  //   return "Looding...";
  // }

  // if (!user) return null;
  return (
    <div className='[--header-height:calc(theme(spacing.14))]'>
      <SidebarProvider className='flex flex-col'>
        <SiteHeader />
        <div className='flex flex-1'>
          <AppSidebar />
          <SidebarInset className='flex flex-col'>
            <Outlet />
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
