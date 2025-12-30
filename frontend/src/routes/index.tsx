import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
// Use useNavigate
import { useUser } from "@/store/user-store";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate({ to: "/auth/login" });
    } else {
      navigate({ to: "/app" });
    }
  }, [user, navigate]);

  // Ideally return null while checking to avoid flash
  return null;
}
