import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/quota/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/app/quota/"!</div>;
}
