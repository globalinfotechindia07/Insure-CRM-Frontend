import API from "../api/axios";

// ================= GET ALL POLICIES =================
export const getPolicies = () => API.get("/policy");

// ================= GET SINGLE POLICY =================
export const getSinglePolicy = (id) => API.get(`/policy/${id}`);

// ================= CREATE POLICY =================
export const createPolicy = (data) => API.post("/policy", data);

// ================= UPDATE POLICY =================
export const updatePolicy = (id, data) => API.put(`/policy/${id}`, data);

// ================= DELETE POLICY =================
export const deletePolicy = (id) => API.delete(`/policy/${id}`);