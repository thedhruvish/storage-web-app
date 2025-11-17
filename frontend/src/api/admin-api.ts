import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosClient from "./axios-client";

// get all the users
export const useGetAllUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await axiosClient.get("/admin/users");
      return response.data.data;
    },
  });
};

// change role
export const useUserChangeRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const response = await axiosClient.patch(`/admin/users/${id}`, {
        role,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },
  });
};

// logout all devices

export const useUserLogoutAllDevices = () => {
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const response = await axiosClient.post(`/admin/users/${id}`);
      return response.data;
    },
  });
};

// user delete change status
export const useUserDeleteStatusChange = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      isDeleted,
    }: {
      id: string;
      isDeleted: boolean;
    }) => {
      const response = await axiosClient.put(`/admin/users/${id}`, {
        isDeleted,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },
  });
};

// user permantaliy delete
export const useHardDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const response = await axiosClient.delete(`/admin/users/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },
  });
};
