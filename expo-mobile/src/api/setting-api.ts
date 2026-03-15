import { useQuery } from "@tanstack/react-query";
import axiosClient from "./axios-client";

export const useGetInfoOnSetting = () => {
  return useQuery({
    queryKey: ["settings", "info"],
    queryFn: async () => {
      const response = await axiosClient.get("/user/settings/info");
      return response.data;
    },
  });
};
