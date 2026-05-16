import API from "../api/axios";

// GET ALL
export const getSurveyors = () =>
  API.get("/surveyor");

// GET SINGLE
export const getSurveyorById = (id) =>
  API.get(`/surveyor/${id}`);

// CREATE
export const createSurveyor = (data) =>
  API.post("/surveyor", data);

// UPDATE
export const updateSurveyor = (id, data) =>
  API.put(`/surveyor/${id}`, data);

// DELETE
export const deleteSurveyor = (id) =>
  API.delete(`/surveyor/${id}`);