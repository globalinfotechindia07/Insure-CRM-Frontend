import API from "../api/axios";

export const getPolicies = () =>
  API.get("/policy");

export const getSinglePolicy = (id) =>
  API.get(`/policy/${id}`);

export const createPolicy = (data) =>
  API.post("/policy", data);

export const updatePolicy = (id, data) =>
  API.put(`/policy/${id}`, data);

export const deletePolicy = (id) =>
  API.delete(`/policy/${id}`);