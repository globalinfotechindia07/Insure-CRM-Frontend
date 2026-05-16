import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5050/api",
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log(error);
    return Promise.reject(error);
  }
);

export default API;