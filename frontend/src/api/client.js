// frontend/src/api/client.js
import axios from "axios";
import { toast } from "react-toastify";

export const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Central Axios instance
const apiClient = axios.create({
  baseURL: backendUrl,
  withCredentials: true, // send HttpOnly auth cookie
  headers: {
    "Content-Type": "application/json",
  },
});

// Allow CSRF token to be set once fetched
export const setCsrfToken = (token) => {
  if (!token) return;
  apiClient.defaults.headers.common["X-CSRF-Token"] = token;
};

// Global error handler
const handleError = (error) => {
  let message = "Something went wrong";

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data;

    if (status === 401) {
      message = data?.message || "Unauthorized. Please log in.";
    } else if (status === 403) {
      message = data?.message || "Forbidden.";
    } else if (status === 429) {
      message =
        data?.message || "Too many requests. Please try again later.";
    } else if (status >= 500) {
      message = data?.message || "Server error. Please try again later.";
    } else if (data?.message) {
      message = data.message;
    }
  } else if (error?.message) {
    message = error.message;
  }

  toast.error(message);
  return Promise.reject(error);
};

apiClient.interceptors.response.use(
  (res) => res,
  (err) => handleError(err)
);

export default apiClient;