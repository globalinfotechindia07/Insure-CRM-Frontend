import { get } from "../api/api";

// ================= GET ALL POLICIES =================
export const getPolicies = () => get("policyDetail");