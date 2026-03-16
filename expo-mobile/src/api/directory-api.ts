import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosClient from "./axios-client";

export const STORAGE_SIZE_API_KEY = "storage-size";

export const useGetAllDirectoryList = (
  directoryId: string = "",
  filter: Record<string, any> = {
    isStarred: undefined,
    search: undefined,
    extensions: undefined,
    size: undefined,
  }
) => {
  return useQuery({
    queryKey: ["directorys", directoryId, filter],
    queryFn: async ({ queryKey }) => {
      const [, id] = queryKey;

      const queryParams = new URLSearchParams();
      if (filter.isStarred) queryParams.append("isStarred", "true");
      if (filter.search) queryParams.append("search", filter.search);
      if (filter.extensions)
        queryParams.append("extensions", filter.extensions);

      if (filter.size && filter.size !== "any") {
        if (filter.size.startsWith("less_")) {
          queryParams.append("less_size", filter.size.replace("less_", ""));
        } else if (filter.size.startsWith("greater_")) {
          queryParams.append(
            "greater_size",
            filter.size.replace("greater_", "")
          );
        }
      }

      const queryString = queryParams.toString();

      const response = await axiosClient.get(
        `/directory/${id || ""}${queryString ? `?${queryString}` : ""}`
      );
      return response.data;
    },
  });
};

export const useGetFilePreview = (fileId: string) => {
  return useQuery({
    queryKey: ["file-preview", fileId],
    queryFn: async () => {
      const response = await axiosClient.get(`/document/${fileId}`);
      return response.data;
    },
    enabled: !!fileId,
  });
};

export const useGetAllTrash = () => {
  return useQuery({
    queryKey: ["trash"],
    queryFn: async () => {
      const response = await axiosClient.get(`/directory/trash`);
      return response.data;
    },
  });
};

// Update directory and invalidate the correct query cache
export const useUpdateDirectory = (directoryId: string = "") => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string } }) =>
      axiosClient.put(`/directory/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["directorys", directoryId],
      });
    },
  });
};

// Delete directory and invalidate the correct query cache
export const useDeleteDirectory = (directoryId: string = "") => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      axiosClient.delete(`/directory/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["directorys", directoryId], // Invalidate the updated directory
      });
      queryClient.invalidateQueries({
        queryKey: [STORAGE_SIZE_API_KEY], // Invalidate the updated directory
      });
    },
  });
};

// create a new directory
export const useCreateDirectory = (directoryId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data }: { data: { name: string } }) =>
      axiosClient.post(`/directory/${directoryId || ""}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["directorys", directoryId], // Invalidate the updated directory
      });
    },
  });
};

export const usestarredToggle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      type,
    }: {
      id: string;
      type: "directory" | "document";
    }) => axiosClient.put(`/${type}/${id}/starred`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["directorys"], // Invalidate the updated directory
      });
    },
  });
};
export const useEmptyTrash = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => axiosClient.delete(`/directory/trash`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STORAGE_SIZE_API_KEY] });
      queryClient.invalidateQueries({
        queryKey: ["directorys"],
      });
      queryClient.invalidateQueries({
        queryKey: ["trash"],
      });
    },
  });
};

export const useRestore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      type,
    }: {
      id: string;
      type: "directory" | "document";
    }) => axiosClient.put(`/${type}/${id}/restore`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STORAGE_SIZE_API_KEY] });
      queryClient.invalidateQueries({
        queryKey: ["directorys"],
      });
      queryClient.invalidateQueries({
        queryKey: ["trash"],
      });
    },
  });
};

export const useHardDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      type,
    }: {
      id: string;
      type: "directory" | "document";
    }) => axiosClient.delete(`/${type}/${id}/hard`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STORAGE_SIZE_API_KEY] });
      queryClient.invalidateQueries({
        queryKey: ["directorys"],
      });
      queryClient.invalidateQueries({
        queryKey: ["trash"],
      });
    },
  });
};

export const useGetSharedWithMe = () => {
  return useQuery({
    queryKey: ["shared-with-me"],
    queryFn: async () => {
      const response = await axiosClient.get(`/directory/shared-with-me`);
      return response.data;
    },
  });
};

interface IMediaType {
  type: "directory" | "document";
  ids: string[];
  action: "sdelete" | "hdelete" | "restore";
}

export const useBatchs = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ type, ids, action }: IMediaType) =>
      axiosClient.post(`/${type}/batch/${action}`, { ids }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["directorys"],
      });
      queryClient.invalidateQueries({
        queryKey: ["trash"],
      });
    },
  });
};
