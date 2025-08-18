import axios from "axios";
import type { AxiosError } from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosClient.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    const apiMessage = (error.response?.data as { message?: string }).message;
    if (apiMessage) {
      error.message = apiMessage; // override
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
