import { AUTH_TOKEN_NAME, handleToken } from "@/utils/handle-token";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useRouter } from "expo-router";

/**
 * Update this URL with your actual backend API base URL
 */
const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = handleToken.getToken(AUTH_TOKEN_NAME);
    if (token) {
      config.headers.Token = token;
    }
    config.headers["X-Platform"] = "mobile";
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("API Error Response:", error.response.data);

      if (error.response.status === 401 || error.response.status === 403) {
        const router = useRouter();
        handleToken.deleteToken(AUTH_TOKEN_NAME);
        router.replace("/(auth)/login");
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("API No Response:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("API Setup Error:", error.message);
    }

    return Promise.reject(error);
  },
);

export default apiClient;
