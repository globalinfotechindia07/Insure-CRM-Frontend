import axios from "axios";
import { retrieveToken } from "./api";

const API = axios.create({
  baseURL: "http://localhost:5050/api",
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
    console.log(error);
    return Promise.reject(error);
  }
);

export default API;