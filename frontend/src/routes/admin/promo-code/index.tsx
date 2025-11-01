import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { getColumnsPromoCode } from "@/pages/admin/promo-code/column-promo-code";
import { toast } from "sonner";
import {
  useDeletePromoCode,
  useGetAllPromoCodes,
  useTogglePromoCode,
} from "@/api/promoCodeApi";
import { Button } from "@/components/ui/button";
import { ContentTableLayout } from "@/components/content-table-layout";
import { DataTable } from "@/components/data-table";

export const Route = createFileRoute("/admin/promo-code/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isLoading, isError, error } = useGetAllPromoCodes();
  const { mutateAsync: toggleMutateAsync } = useTogglePromoCode();
  const { mutateAsync: deleteMutateAsync } = useDeletePromoCode();

  const handleDelete = (id: string) => {
    toast.promise(deleteMutateAsync(id), {
      loading: "Deleting Promo code...",
      success: "Delete Promo code successfully",
      error: "Delete Promo code failed",
    });
  };
  const handleToggleActive = (id: string, isActive: boolean) => {
    toast.promise(toggleMutateAsync({ id, isActive: !isActive }), {
      loading: "Changing Promo code status...",
      success: "Change Promo code status successfully",
      error: "Change Promo code status failed",
    });
  };
  const columns = useMemo(
    () => getColumnsPromoCode(handleDelete, handleToggleActive),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <ContentTableLayout
      title='Plans'
      buttons={
        <Link to='/admin/promo-code/new'>
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
          data={data || []}
          searchKey='code'
          isLoading={isLoading}
        />
      )}
      ;
    </ContentTableLayout>
  );
}
