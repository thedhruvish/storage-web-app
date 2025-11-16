import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosClient from "./axiosClient";

export const checkConnectedGoogle = ({ enabled }: { enabled: boolean }) => {
  return useQuery({
    queryKey: ["check-connected-google"],
    queryFn: async () => {
      const response = await axiosClient.get(
        "/import-data/google/check-connected"
      );
      return response.data;
    },
    enabled: enabled,
  });
};

export const useImportFolderByDrive = (directoryId: string = "") => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      mimeType,
      name,
    }: {
      id: string;
      mimeType: string;
      name: string;
    }) =>
      axiosClient.post(`/import-data/google/file-data/${directoryId}`, {
        id,
        mimeType,
        name,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["directorys", directoryId],
      });
    },
  });
};

export const useGoogleAccessToken = (options: { enabled: boolean }) => {
  return useQuery<{ data: { accessToken: string } }>({
    queryKey: ["google-access-token"],
    queryFn: async () => {
      const response = await axiosClient.get(
        "/import-data/google/get-access-token"
      );
      return response.data;
    },
    enabled: options.enabled,
    staleTime: 1000 * 60 * 50,
    refetchOnWindowFocus: false,
  });
};
