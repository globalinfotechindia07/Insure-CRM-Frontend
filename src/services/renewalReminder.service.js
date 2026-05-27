import API from "../api/axios";

// ================= GET ALL REMINDERS =================
export const getReminders = () => API.get("/renewal-reminder");

// ================= GET REMINDER BY ID =================
export const getReminderById = (id) => API.get(`/renewal-reminder/${id}`);

// ================= GET REMINDERS BY DATE RANGE =================
export const getRemindersByDateRange = (startDate, endDate) => 
  API.get(`/renewal-reminder/date-range?startDate=${startDate}&endDate=${endDate}`);

// ================= GET REMINDERS BY POLICY ID =================
export const getRemindersByPolicy = (policyId) => 
  API.get(`/renewal-reminder/policy/${policyId}`);

// ================= GET EXPIRING POLICIES WITHOUT REMINDER =================
export const getExpiringPoliciesWithoutReminder = () => 
  API.get("/renewal-reminder/expiring-policies");

// ================= GET REMINDERS BY CUSTOMER NAME =================
export const getRemindersByCustomerName = (name) => 
  API.get(`/renewal-reminder/customer/search?name=${name}`);

// ================= CREATE REMINDER =================
export const createReminder = (data) => API.post("/renewal-reminder", data);

// ================= AUTO CREATE REMINDERS =================
export const autoCreateReminders = () => API.post("/renewal-reminder/auto-create");

// ================= UPDATE REMINDER =================
export const updateReminder = (id, data) => API.put(`/renewal-reminder/${id}`, data);

// ================= DELETE REMINDER =================
export const deleteReminder = (id) => API.delete(`/renewal-reminder/${id}`);

// ================= DELETE ALL REMINDERS =================
export const deleteAllReminders = () => API.delete("/renewal-reminder");