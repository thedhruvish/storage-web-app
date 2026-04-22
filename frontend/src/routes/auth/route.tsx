import { useEffect } from "react";
import {
  Outlet,
  createFileRoute,
  useNavigate,
  useLocation,
  Link,
} from "@tanstack/react-router";
import { APP_NAME } from "@/contansts";
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
  const isWidePage =
    isSetupPage ||
    location.pathname.includes("/auth/login") ||
    location.pathname.includes("/auth/signup");

  return (
    <div className='bg-background flex min-h-svh flex-col items-center justify-center p-6 md:p-10'>
      <div
        className={cn(
          "flex w-full flex-col gap-8",
          isWidePage ? "max-w-4xl" : "max-w-[400px]"
        )}
      >
        <Link
          to='/'
          className='flex flex-col items-center gap-3 self-center transition-opacity hover:opacity-80'
        >
          <div className='bg-primary text-primary-foreground flex size-11 items-center justify-center rounded-xl shadow-sm'>
            <GalleryVerticalEnd className='size-6' />
          </div>
          <span className='text-2xl font-bold tracking-tight text-foreground'>
            {APP_NAME}
          </span>
        </Link>
        <div className='animate-scale-in'>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
