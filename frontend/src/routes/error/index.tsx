import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/error/")({
  beforeLoad: () => {
    throw redirect({ to: "/error/404" });
  },
});
