import { useEffect } from "react";
import {
  Outlet,
  createFileRoute,
  useNavigate,
  useLocation,
} from "@tanstack/react-router";
import { useUser } from "@/store/user-store";
import { GalleryVerticalEnd } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      navigate({ to: "/" });
    }
  }, [user, navigate]);

  const isSetupPage = location.pathname.includes("/auth/2fa/setup");

  return (
    <div className='bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10'>
      <div
        className={cn(
          "flex w-full flex-col gap-6",
          isSetupPage ? "max-w-2xl" : "max-w-sm"
        )}
      >
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
