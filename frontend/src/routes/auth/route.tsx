import { useEffect } from "react";
import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useUser } from "@/store/user-store";
import { GalleryVerticalEnd } from "lucide-react";

export const Route = createFileRoute("/auth")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = useUser();
  const navagate = useNavigate();

  useEffect(() => {
    if (user) {
      navagate({ to: "/" });
    }
  }, [user, navagate]);

  return (
    <div className='bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10'>
      <div className='flex w-full max-w-sm flex-col gap-6'>
        <a href='#' className='flex items-center gap-2 self-center font-medium'>
          <div className='bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md'>
            <GalleryVerticalEnd className='size-4' />
          </div>
          Dhruvish Inc.
        </a>
        <Outlet />
      </div>
    </div>
  );
}
