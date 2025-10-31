import { createFileRoute } from "@tanstack/react-router";
import { PlanCreateForm } from "@/pages/admin/plan/PlanCreateForm";
import { ContentTableLayout } from "@/components/content-table-layout";

export const Route = createFileRoute("/admin/plan/new")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ContentTableLayout title='New Plan'>
      <PlanCreateForm />
    </ContentTableLayout>
  );
}
