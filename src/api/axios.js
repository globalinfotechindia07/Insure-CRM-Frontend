import axios from "axios";
import { retrieveToken } from "./api";
import { toast } from "react-toastify";

const API = axios.create({
  baseURL: "http://localhost:5050/api",
  // baseURL: "https://insure-crm-backend-1-n420.onrender.com/api",
});

API.interceptors.request.use(
  (config) => {
    const token = retrieveToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("🔥 Axios Response Error:", error);
    const status = error.response ? error.response.status : null;

    if (status === 401) {
      toast.error("Session expired or unauthorized. Please log in again.");
    } else if (status === 403) {
      toast.error("You do not have permission to perform this action.");
    } else if (status === 500) {
      const serverErr = error.response?.data?.error || error.response?.data?.message || "Server error occurred. Please try again later.";
      toast.error(typeof serverErr === 'string' ? serverErr : "Server error occurred.");
    } else if (!error.response) {
      toast.error("Network connection error. Please verify backend server connection.");
    }

    return Promise.reject(error);
  }
);

export default API;