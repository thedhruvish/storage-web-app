import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/promo-code/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/admin/promo-code/"!</div>;
}
