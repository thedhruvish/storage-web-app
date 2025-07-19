import { useQuery } from "@tanstack/react-query";
import axiosClient from "./axiosClient";

export const useGetAllDirectoryList = (directoryId?: string) => {
  return useQuery({
    queryKey: ["directorys", directoryId],
    queryFn: async ({ queryKey }) => {
      const [, id] = queryKey;
      const response = await axiosClient.get(`/directory/${id || ""}`);
      return response.data;
    },
  });
};
