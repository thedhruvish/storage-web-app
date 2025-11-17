import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDialogStore } from "@/store/dialogs-store";
import axiosClient from "./axios-client";

export const useGetAllDirectoryList = (directoryId: string = "") => {
  return useQuery({
    queryKey: ["directorys", directoryId],
    queryFn: async ({ queryKey }) => {
      const [, id] = queryKey;
      const response = await axiosClient.get(`/directory/${id || ""}`);
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
    queryKey: [directoryId, "permission", "directory"],
    queryFn: async ({ queryKey }) => {
      const [id] = queryKey;
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
    }) => axiosClient.post(`/permission/${dirId}/directory`, data),
    onSuccess(_, { dirId }) {
      queryClient.invalidateQueries({
        queryKey: [dirId, "permission", "directory"],
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
        queryKey: [dirId, "permission", "directory"],
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
      queryClient.invalidateQueries({
        queryKey: [dirId, "permission", "directory"],
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
