import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useUser } from "@/store/user-store";
import { useLogout } from "@/api/auth";

export const Route = createFileRoute("/_authenticated/logout")({
  component: LogoutComponent,
});

function LogoutComponent() {
  const logouthook = useLogout();
  const navigate = useNavigate();
  const { user, clearUser } = useUser();

  useEffect(() => {
    if (user) {
      clearUser();
      logouthook.mutate();
    }
    navigate({ to: "/login" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, clearUser, logouthook]);
  if (logouthook.isPending) {
    return "Logging out...";
  }
  return <></>;
}
