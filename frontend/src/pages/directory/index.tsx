import { useEffect } from "react";
import { useParams } from "@tanstack/react-router";
import { DirectoryContent } from "@/pages/directory/components/directory-content";
import { useBreadCrumStore } from "@/store/breadCrum-store";
import { useGetAllDirectoryList } from "@/api/directory-api";

export default function Home({
  directoryId: propDirectoryId = "",
}: {
  directoryId?: string;
}) {
  const { setStatus, setPath, setCurrentItem } = useBreadCrumStore();
  const params = useParams({ strict: false });
  const directoryId =
    (params as { directoryId?: string }).directoryId || propDirectoryId;

  const { data, isLoading, isError, isSuccess, error } =
    useGetAllDirectoryList(directoryId);

  // Handle Side Effects (Breadcrumbs)
  useEffect(() => {
    if (isLoading) setStatus("loading");
    else if (isError) setStatus("error");
    else if (isSuccess && data) {
      setStatus("success");
      const { path } = data.data.path;
      setPath(path.slice(1));
      const currentName = data.data.path.name;
      if (currentName.startsWith("root")) {
        setCurrentItem(null);
      } else {
        setCurrentItem(currentName);
      }
    }
  }, [isLoading, isError, isSuccess, data, setPath, setCurrentItem, setStatus]);

  return (
    <DirectoryContent
      files={{
        directories: data?.data?.directories,
        documents: data?.data?.documents,
      }}
      isLoading={isLoading}
      isError={isError}
      error={error as Error}
      allowedUpload={true}
      emptyMessage='This folder is empty'
      directoryId={directoryId}
    />
  );
}
