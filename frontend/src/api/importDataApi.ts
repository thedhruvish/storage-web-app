import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDialogStore } from "@/store/DialogsStore";
import axiosClient from "./axiosClient";

export const checkConnectedGoogle = () => {
  return useQuery({
    queryKey: ["check-connected-google"],
    queryFn: async () => {
      const response = await axiosClient.get(
        "/import-data/google/check-connected"
      );
      return response.data;
    },
    enabled: !!(useDialogStore.getState().open === "importFile"),
  });
};

export const useImportFolderByDrive = (directoryId: string = "") => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      axiosClient.post(`/import-data/google/file-data/${directoryId}`, {
        folderId: id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["directorys", directoryId], // Invalidate the updated directory
      });
    },
  });
};
