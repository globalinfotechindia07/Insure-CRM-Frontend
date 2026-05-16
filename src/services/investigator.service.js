import API from "../api/axios";

export const getInvestigators = () =>
  API.get("/investigator");

export const createInvestigator = (data) =>
  API.post("/investigator", data);