import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { STORAGE_SIZE_API_KEY } from "./directory-api";
import axiosClient from "./axios-client";

// update
export const useUpdateDocument = (directoryId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string } }) =>
      axiosClient.put(`/document/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["directorys", directoryId], // Invalidate the updated directory
      });
    },
  });
};

// Delete Document and invalidate the correct query cache
export const useDeleteDocument = (directoryId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      axiosClient.delete(`/document/${id}`),
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

export const useGetShareDocument = (shareId: string) => {
  return useQuery({
    queryKey: ["share", shareId],
    queryFn: async () => {
      const response = await axiosClient.get(`/permission/share/${shareId}`);
      return response.data;
    },
    enabled: !!shareId,
  });
};
