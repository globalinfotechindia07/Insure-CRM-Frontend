import axios from "axios";

// const API = "http://localhost:5050/api/claim";
const API = "https://grampanchayattigaon/api/claim";


// =========================================
// BASIC CRUD OPERATIONS
// =========================================

// GET ALL CLAIMS
export const getClaims = () =>
  axios.get(API);

// GET SINGLE CLAIM
export const getClaimById = (id) =>
  axios.get(`${API}/${id}`);

// CREATE CLAIM
export const createClaim = (data) =>
  axios.post(API, data);

// UPDATE CLAIM (Full Update)
export const updateClaim = (id, data) =>
  axios.put(`${API}/${id}`, data);

// DELETE CLAIM
export const deleteClaim = (id) =>
  axios.delete(`${API}/${id}`);

// =========================================
// SPECIAL ACTION APIs (UPDATED)
// =========================================

// ASSIGN CLAIM (Preliminary Surveyor, Final Surveyor, TPA, Investigator)
export const assignClaim = (id, data) =>
  axios.put(`${API}/${id}/assign`, data);

// APPROVE CLAIM
export const approveClaim = (id, data) =>
  axios.put(`${API}/${id}/approve`, data);

// UPDATE POST HOSPITALIZATION DETAILS
export const updatePostHospitalization = (id, data) =>
  axios.put(`${API}/${id}/post-hospitalization`, data);

// UPDATE LOSS DETAILS
export const updateLossDetails = (id, data) =>
  axios.put(`${API}/${id}/loss-details`, data);

// UPDATE TRANSPORT/MARINE DETAILS
export const updateTransportDetails = (id, data) =>
  axios.put(`${API}/${id}/transport-details`, data);