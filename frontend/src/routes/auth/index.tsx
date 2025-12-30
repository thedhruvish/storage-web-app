import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/")({
  beforeLoad: () => {
    throw redirect({
      to: "/auth/login",
    });
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/auth/"!</div>;
}
