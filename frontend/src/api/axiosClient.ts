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
    let apiMessage = "Unexpected error occurred";

    if (
      error.code === "ERR_NETWORK" ||
      error.code === "ERR_CONNECTION_REFUSED"
    ) {
      // Network error (backend down, wrong URL, etc.)
      apiMessage =
        "Cannot connect to the server. Please check your connection.";
    } else if (error.response?.data) {
      // Try to extract backend message
      apiMessage =
        (error.response.data as { message?: string })?.message ||
        error.response.statusText ||
        apiMessage;
    } else if (error.message) {
      apiMessage = error.message;
    }

    error.message = apiMessage; // Override with friendly message
    return Promise.reject(error);
  }
);

export default axiosClient;
