import axios from "axios";
import { retrieveToken } from "../api/api";

const API = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
});

API.interceptors.request.use((config) => {
  const token = retrieveToken();
  const companyId = localStorage.getItem('companyId');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (companyId) {
    config.params = { ...config.params, companyId };
  }
  return config;
});

export const createCustomer = (data) => API.post("/customers", data);
export const getCustomers = () => API.get("/customers");
export const deleteCustomer = (id) => API.delete(`/customers/${id}`);
export const updateCustomer = (id, data) => API.put(`/customers/${id}`, data);