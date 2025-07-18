import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useLogout } from "@/api/auth";
import { useUser } from "@/store/userStore";

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
    } else {
      navigate({ to: "/login" });
    }
  }, [user, clearUser, logouthook]);
  if (logouthook.isPending) {
    return "Logging out...";
  }
  return <></>;
}
