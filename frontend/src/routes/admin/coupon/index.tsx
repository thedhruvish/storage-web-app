import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/coupon/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/admin/coupon/"!</div>;
}
