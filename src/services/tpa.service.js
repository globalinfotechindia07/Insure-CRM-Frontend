import API from "../api/axios";

// GET ALL
export const getTPAs = () =>
  API.get("/tpa");

// GET SINGLE
export const getTPAById = (id) =>
  API.get(`/tpa/${id}`);

// CREATE
export const createTPA = (data) =>
  API.post("/tpa", data);

// UPDATE
export const updateTPA = (id, data) =>
  API.put(`/tpa/${id}`, data);

// DELETE
export const deleteTPA = (id) =>
  API.delete(`/tpa/${id}`);