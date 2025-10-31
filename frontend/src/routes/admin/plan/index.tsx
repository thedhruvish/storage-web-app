import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { getColumns } from "@/pages/admin/plan/column";
import { toast } from "sonner";
import { useDeletePlan, useGetAllPlans, useTogglePlan } from "@/api/planApi";
import { Button } from "@/components/ui/button";
import { ContentTableLayout } from "@/components/content-table-layout";
import { DataTable } from "@/components/data-table";

export const Route = createFileRoute("/admin/plan/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isLoading, isError, error } = useGetAllPlans();
  const { mutateAsync: togglePlanMutateAsync } = useTogglePlan();
  const { mutateAsync: deleteMutateAsync } = useDeletePlan();
  const handleDelete = (planId: string) => {
    toast.promise(deleteMutateAsync({ id: planId }), {
      loading: "Deleting plan...",
      success: "Delete plan successfully",
      error: "Delete plan failed",
    });
  };

  // Action Handler: Toggle Active Status
  const handleToggleActive = (planId: string) => {
    toast.promise(togglePlanMutateAsync({ id: planId }), {
      loading: "Changing plan status...",
      success: "Change plan status successfully",
      error: "Change plan status failed",
    });
  };
  const columns = useMemo(
    () => getColumns(handleDelete, handleToggleActive),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <ContentTableLayout
      title='Plans'
      buttons={
        <Link to='/admin/plan/new'>
          <Button size={"sm"}>Create New Plan</Button>
        </Link>
      }
    >
      {isError ? (
        <>{error}</>
      ) : (
        <DataTable
          showRowSelection={true}
          columns={columns}
          data={data?.plans || []}
          searchKey='title'
          isLoading={isLoading}
        />
      )}
      ;
    </ContentTableLayout>
  );
}
