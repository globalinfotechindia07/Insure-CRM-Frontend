import API from "../api/axios";

// =========================================
// BASIC CRUD OPERATIONS
// =========================================

// GET ALL CLAIMS
export const getClaims = () =>
  API.get("/claim");

// GET SINGLE CLAIM
export const getClaimById = (id) =>
  API.get(`/claim/${id}`);

// CREATE CLAIM
export const createClaim = (data) =>
  API.post("/claim", data);

// UPDATE CLAIM (Full Update)
export const updateClaim = (id, data) =>
  API.put(`/claim/${id}`, data);

// DELETE CLAIM
export const deleteClaim = (id) =>
  API.delete(`/claim/${id}`);

// =========================================
// SPECIAL ACTION APIs (UPDATED)
// =========================================

// ASSIGN CLAIM (Preliminary Surveyor, Final Surveyor, TPA, Investigator)
export const assignClaim = (id, data) =>
  API.put(`/claim/${id}/assign`, data);

// APPROVE CLAIM
export const approveClaim = (id, data) =>
  API.put(`/claim/${id}/approve`, data);

// UPDATE POST HOSPITALIZATION DETAILS
export const updatePostHospitalization = (id, data) =>
  API.put(`/claim/${id}/post-hospitalization`, data);

// UPDATE LOSS DETAILS
export const updateLossDetails = (id, data) =>
  API.put(`/claim/${id}/loss-details`, data);

// UPDATE TRANSPORT/MARINE DETAILS
export const updateTransportDetails = (id, data) =>
  API.put(`/claim/${id}/transport-details`, data);