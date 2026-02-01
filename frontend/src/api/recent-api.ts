import { useQuery } from "@tanstack/react-query";
import axiosClient from "./axios-client";

export const useGetRecentFiles = () => {
  return useQuery({
    queryKey: ["recent-files"],
    queryFn: async () => {
      const response = await axiosClient.get("/recent");
      return response.data;
    },
  });
};
