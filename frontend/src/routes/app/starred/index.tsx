import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { DirectoryContent } from "@/pages/directory/components/directory-content";
import { useBreadCrumStore } from "@/store/breadCrum-store";
import { useUser } from "@/store/user-store";
import { useGetAllDirectoryList } from "@/api/directory-api";

export const Route = createFileRoute("/app/starred/")({
  component: StarredPage,
});

function StarredPage() {
  const { setStatus, setPath, setCurrentItem } = useBreadCrumStore();
  const { user } = useUser();

  const { data, isLoading, isError, error } = useGetAllDirectoryList(
    user?.rootDirId || "",
    {
      isStarred: true,
    }
  );

  // Breadcrumbs
  useEffect(() => {
    setStatus("success");
    setPath([]);
    setCurrentItem("Starred");
  }, [setStatus, setPath, setCurrentItem]);

  return (
    <DirectoryContent
      files={{
        directories: data?.data?.directories,
        documents: data?.data?.documents,
      }}
      isLoading={isLoading}
      isError={isError}
      error={error}
      allowedUpload={false}
      emptyMessage='No starred items'
      directoryId={user?.rootDirId}
    />
  );
}
