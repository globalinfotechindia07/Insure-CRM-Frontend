import axios from "axios";

const API = "http://localhost:5050/api/claim";

// GET ALL CLAIMS
export const getClaims = () =>
  axios.get(API);

// GET SINGLE CLAIM
export const getClaimById = (id) =>
  axios.get(`${API}/${id}`);

// CREATE CLAIM
export const createClaim = (data) =>
  axios.post(API, data);

// UPDATE CLAIM
export const updateClaim = (id, data) =>
  axios.put(`${API}/${id}`, data);

// ASSIGN CLAIM
export const assignClaim = (id, data) =>
  axios.put(`${API}/assign/${id}`, data);

// APPROVE CLAIM
export const approveClaim = (id, data) =>
  axios.put(`${API}/approval/${id}`, data);

// DELETE CLAIM
export const deleteClaim = (id) =>
  axios.delete(`${API}/${id}`);