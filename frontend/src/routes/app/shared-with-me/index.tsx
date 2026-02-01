import { createFileRoute } from "@tanstack/react-router";
import { DirectoryContent } from "@/pages/directory/components/directory-content";
import { useGetSharedWithMe } from "@/api/directory-api";

export const Route = createFileRoute("/app/shared-with-me/")({
  component: SharedWithMePage,
});

function SharedWithMePage() {
  const { data, isLoading, isError, error } = useGetSharedWithMe();

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
      emptyMessage='No files shared with you'
      directoryId=''
      enableContextMenu={true}
    />
  );
}
