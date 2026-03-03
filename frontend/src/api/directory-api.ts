import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { STORAGE_SIZE_API_KEY } from "@/contansts";
import { useDialogStore } from "@/store/dialogs-store";
import { useStorageStatus } from "@/hooks/use-storage-status";
import axiosClient from "./axios-client";

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

// get permission users list
export const useGetDirectoryPermissionUsers = (directoryId?: string) => {
  return useQuery({
    queryKey: ["permission", directoryId, "directory"],
    queryFn: async ({ queryKey }) => {
      const [_, id] = queryKey;
      const response = await axiosClient.get(`/permission/${id}/directory`);
      return response.data;
    },

    enabled: !!(useDialogStore.getState().open === "share" && !!directoryId),
  });
};

// add permision on the directory
export const useAddDirectoryPermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      dirId,
      data,
    }: {
      dirId: string;
      data: { email: string; role?: string };
    }) => {
      if (!dirId) throw new Error("Directory ID is required");
      if (!data.email) throw new Error("Email is required");
      return axiosClient.post(`/permission/${dirId}/directory`, data);
    },
    onSuccess(_, { dirId }) {
      queryClient.invalidateQueries({
        queryKey: ["permission", dirId, "directory"],
      });
    },
  });
};

// change permission on User
export const useChangeDirectoryPermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      dirId,
      data,
    }: {
      dirId: string;
      data: {
        userId: string;
        role: string;
      };
    }) => axiosClient.put(`/permission/${dirId}/directory`, data),
    onSuccess(_, { dirId }) {
      queryClient.invalidateQueries({
        queryKey: ["permission", dirId, "directory"],
      });
    },
  });
};

// remove user from directory permission
export const useRemoveDirectoryPermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      dirId,
      data,
    }: {
      dirId: string;
      data: { userId: string };
    }) => axiosClient.delete(`/permission/${dirId}/directory`, { data }),
    onSuccess(_, { dirId }) {
      console.log("log run permision", dirId);
      queryClient.invalidateQueries({
        queryKey: ["permission", dirId, "directory"],
      });
    },
  });
};

// delete share link
export const useDeleteDirectoryShareLink = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ dirId }: { dirId: string }) =>
      axiosClient.delete(`/permission/share/${dirId}`),
    onSuccess(_, { dirId }) {
      queryClient.invalidateQueries({
        queryKey: ["permission", dirId, "directory"],
      });
    },
  });
};

// create a short share link
export const useCreateDirectoryShareShortLink = () => {
  return useMutation({
    mutationFn: ({
      dirId,
      data,
    }: {
      dirId: string;
      data: { shareLink: string };
    }) => axiosClient.post(`/permission/share/${dirId}`, data),
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
  const { refreshStorage } = useStorageStatus();
  return useMutation({
    mutationFn: ({ type, ids, action }: IMediaType) =>
      axiosClient.post(`/${type}/batch/${action}`, { ids }),
    onSuccess: () => {
      refreshStorage();
      queryClient.invalidateQueries({
        queryKey: ["directorys"],
      });
      queryClient.invalidateQueries({
        queryKey: ["trash"],
      });
    },
  });
};
