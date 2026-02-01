import { createFileRoute } from "@tanstack/react-router";
import { DirectoryContent } from "@/pages/directory/components/directory-content";
import { useGetRecentFiles } from "@/api/recent-api";

export const Route = createFileRoute("/app/recent/")({
  component: RecentPage,
});

function RecentPage() {
  const { data, isLoading, isError, error } = useGetRecentFiles();

  return (
    <DirectoryContent
      files={{
        directories: data?.data?.directories,
        documents: data?.data?.documents,
      }}
      isLoading={isLoading}
      isError={isError}
      error={error as Error}
      allowedUpload={false}
      emptyMessage='No recent files'
      directoryId=''
      enableContextMenu={true}
    />
  );
}
