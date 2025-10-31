import { createFileRoute } from "@tanstack/react-router";
import { PromoCodeForm } from "@/pages/admin/promo-code/promo-code-form";
import { ContentTableLayout } from "@/components/content-table-layout";

export const Route = createFileRoute("/admin/promo-code/new")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ContentTableLayout title='New Plan'>
      <PromoCodeForm />
    </ContentTableLayout>
  );
}
