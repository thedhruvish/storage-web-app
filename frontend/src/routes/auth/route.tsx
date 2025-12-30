import { useEffect } from "react";
import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useUser } from "@/store/user-store";

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

  return <Outlet />;
}
