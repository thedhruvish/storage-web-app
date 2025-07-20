import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosClient from "./axiosClient";

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
