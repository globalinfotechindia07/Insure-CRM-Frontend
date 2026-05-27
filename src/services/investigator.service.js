import API from "../api/axios";

// GET ALL INVESTIGATORS
export const getInvestigators = () =>
  API.get("/investigator");

// GET ACTIVE INVESTIGATORS ONLY
export const getActiveInvestigators = () =>
  API.get("/investigator/active");

// GET SINGLE INVESTIGATOR
export const getSingleInvestigator = (id) =>
  API.get(`/investigator/${id}`);

// CREATE INVESTIGATOR
export const createInvestigator = (data) =>
  API.post("/investigator", data);

// UPDATE INVESTIGATOR
export const updateInvestigator = (id, data) =>
  API.put(`/investigator/${id}`, data);

// DELETE INVESTIGATOR (Hard delete)
export const deleteInvestigator = (id) =>
  API.delete(`/investigator/${id}`);

// SOFT DELETE (Toggle status)
export const toggleInvestigatorStatus = (id) =>
  API.patch(`/investigator/${id}/toggle-status`);