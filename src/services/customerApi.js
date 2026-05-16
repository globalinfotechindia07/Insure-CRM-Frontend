import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5050/api",
});

export const createCustomer = (data) => API.post("/customers", data);
export const getCustomers = () => API.get("/customers");
export const deleteCustomer = (id) => API.delete(`/customers/${id}`);