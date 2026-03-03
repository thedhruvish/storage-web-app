import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { DirectoryContent } from "@/pages/directory/components/directory-content";
import { useBreadCrumStore } from "@/store/breadCrum-store";
import { useSearchStore } from "@/store/search-store";
import { useUser } from "@/store/user-store";
import { useGetAllDirectoryList } from "@/api/directory-api";
import { useDebounce } from "@/hooks/use-debounce";

export const Route = createFileRoute("/app/starred/")({
  component: StarredPage,
});

function StarredPage() {
  const { setStatus, setPath, setCurrentItem } = useBreadCrumStore();
  const { user } = useUser();

  const { query, extensions, size } = useSearchStore();
  const debouncedQuery = useDebounce(query, 500);
  const debouncedExtensions = useDebounce(extensions, 500);

  const { data, isLoading, isError, error } = useGetAllDirectoryList(
    user?.rootDirId || "",
    {
      isStarred: true,
      search: debouncedQuery,
      extensions: debouncedExtensions,
      size,
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
