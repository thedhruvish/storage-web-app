import { createFileRoute } from "@tanstack/react-router";
import { CouponForm } from "@/pages/admin/coupon/coupon-form";
import { ContentTableLayout } from "@/components/content-table-layout";

export const Route = createFileRoute("/admin/coupon/new")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ContentTableLayout title='New Plan'>
      <CouponForm />
    </ContentTableLayout>
  );
}
