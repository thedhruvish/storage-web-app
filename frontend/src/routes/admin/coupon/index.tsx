import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { getColumnsCoupon } from "@/pages/admin/coupon/column-coupon";
import { toast } from "sonner";
import { useDeleteCoupon, useGetAllCoupon } from "@/api/couponApi";
import { Button } from "@/components/ui/button";
import { ContentTableLayout } from "@/components/content-table-layout";
import { DataTable } from "@/components/data-table";

export const Route = createFileRoute("/admin/coupon/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isLoading, isError, error } = useGetAllCoupon();
  const { mutateAsync: deleteMutateAsync } = useDeleteCoupon();
  const handleDelete = (planId: string) => {
    toast.promise(deleteMutateAsync(planId), {
      loading: "Deleting plan...",
      success: "Delete plan successfully",
      error: "Delete plan failed",
    });
  };

  const columns = useMemo(
    () => getColumnsCoupon(handleDelete),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <ContentTableLayout
      title='Coupons'
      buttons={
        <Link to='/admin/coupon/new'>
          <Button size={"sm"}>Create New Coupon</Button>
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
          searchKey='id'
          isLoading={isLoading}
        />
      )}
      ;
    </ContentTableLayout>
  );
}
