import axios from "axios";
import { retrieveToken } from "./api";
import { toast } from "react-toastify";

const API = axios.create({
  // baseURL: "http://localhost:5050/api",
  baseURL: "https://api.jpinsurancebrokers.co.in/api",
  // baseURL: "https://insure-crm-backend-1-n420.onrender.com/api",
});

API.interceptors.request.use(
  (config) => {
    const token = retrieveToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;  
    }
    if (config.data && !(config.data instanceof FormData)) {
      config.data = convertBsonObjectIdToString(config.data);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const convertBsonObjectIdToString = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(convertBsonObjectIdToString);
  }

  // Format 1: { type: 'Buffer', data: [...] }
  if (obj.type === 'Buffer' && Array.isArray(obj.data) && obj.data.length === 12) {
    return obj.data.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Format 2: { buffer: { '0': 106, '1': 105, ... } }
  if (Object.keys(obj).length === 1 && obj.buffer && typeof obj.buffer === 'object') {
    const bufKeys = Object.keys(obj.buffer);
    if (bufKeys.length === 12) {
      let isBuffer = true;
      let hexString = '';
      for (let i = 0; i < 12; i++) {
        const val = obj.buffer[String(i)];
        if (typeof val !== 'number') {
          isBuffer = false;
          break;
        }
        hexString += val.toString(16).padStart(2, '0');
      }
      if (isBuffer) return hexString;
    }
  }

  const newObj = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      newObj[key] = convertBsonObjectIdToString(obj[key]);
    }
  }
  return newObj;
};

API.interceptors.response.use(
  (response) => {
    if (response && response.data) {
      response.data = convertBsonObjectIdToString(response.data);
    }
    return response;
  },
  (error) => {
    console.error("🔥 Axios Response Error:", error);
    const status = error.response ? error.response.status : null;

    if (status === 401) {
      toast.error("Session expired or unauthorized. Please log in again.");
    } else if (status === 403) {
      toast.error("You do not have permission to perform this action.");
    } else if (status === 500) {
      const serverErr = error.response?.data?.error || error.response?.data?.message || "Server error occurred. Please try again later.";
      toast.error(typeof serverErr === 'string' ? serverErr : "Server error occurred.");
    } else if (!error.response) {
      toast.error("Network connection error. Please verify backend server connection.");
    }

    return Promise.reject(error);
  }
);

export default API;