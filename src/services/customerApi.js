import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
  // baseURL: "https://api.jpinsurancebrokers.co.in/api",
  // baseURL: "https://insure-crm-backend-1-n420.onrender.com/api",
});

export const createCustomer = (data) => API.post("/customers", data);
export const getCustomers = () => API.get("/customers");
export const deleteCustomer = (id) => API.delete(`/customers/${id}`);
export const updateCustomer = (id, data) => API.put(`/customers/${id}`, data);