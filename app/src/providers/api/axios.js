import axios from "axios";
import { useLocalStorage } from "@vueuse/core";

/** Import API URL from .env */
const ROOT_URL = `${import.meta.env.VITE_API_URL}`;

/** Create an axios instance */
const axiosInstance = axios.create({
  baseURL: ROOT_URL,
});

/** Create a request interceptor */
axiosInstance.interceptors.request.use((config) => {
  /** Grab token from localStorage directly to avoid stale closure of useLocalStorage */
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Handle Forbidden and Unauthorized errors */
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response) {
      console.error("Network or CORS error:", error);
      return Promise.reject(error);
    }

    const status = error.response.status;

    if (status === 401) {
      console.warn("Unauthorized access detected. Logging out...");
      const { useAuthStore } = await import("../../store/auth.store");
      const authStore = useAuthStore();
      await authStore.logout();
      // Optional: redirect to login page
    } else if (status === 403) {
      console.warn("Forbidden access detected. Logging out...");
      const { useAuthStore } = await import("../../store/auth.store");
      const authStore = useAuthStore();
      await authStore.logout();
      // Optional: redirect to login page
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
