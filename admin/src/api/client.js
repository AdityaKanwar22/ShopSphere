// admin/src/api/client.js
import axios from "axios";
import { toast } from "react-toastify";

export const backendUrl = import.meta.env.VITE_BACKEND_URL;

const apiClient = axios.create({
  baseURL: backendUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    let msg = "Something went wrong";
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      const data = err.response?.data;
      if (data?.message) msg = data.message;
      else if (status === 401) msg = "Unauthorized";
      else if (status === 403) msg = "Forbidden";
      else if (status === 429) msg = "Too many requests";
      else if (status >= 500) msg = "Server error";
    }
    toast.error(msg);
    return Promise.reject(err);
  }
);

export default apiClient;