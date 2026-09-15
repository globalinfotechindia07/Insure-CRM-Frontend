import axios from 'axios';
import { toUppercasePayload } from 'utils/uppercaseUtils';

const convertBsonObjectIdToString = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(convertBsonObjectIdToString);
  if (obj.type === 'Buffer' && Array.isArray(obj.data) && obj.data.length === 12) {
    return obj.data.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  if (obj.buffer && typeof obj.buffer === 'object') {
    const bufKeys = Object.keys(obj.buffer);
    if (bufKeys.length === 12) {
      let isBuffer = true, hexString = '';
      for (let i = 0; i < 12; i++) {
        const val = obj.buffer[String(i)];
        if (typeof val !== 'number') { isBuffer = false; break; }
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

const REACT_APP_API_URL = import.meta.env.VITE_APP_API_URL;

export default REACT_APP_API_URL;

export const retrieveToken = () => {
  let token = localStorage.getItem('token') || '';
  if (!token) {
    document.cookie.split('; ').forEach((v) => {
      if (v.trim().split('=')[0] === 'hmsToken') {
        token = v.split('=')[1];
      }
    });
  }
  return token;
};

export const get = async (url) => {
  const token = retrieveToken();
  const companyId = localStorage.getItem('companyId');
  const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
  const fullUrl = `${REACT_APP_API_URL}${cleanUrl}${cleanUrl.includes('?') ? '&' : '?'}companyId=${encodeURIComponent(companyId)}`;

  try {
    const response = await axios.get(fullUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('token');
      document.cookie = 'hmsToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      window.location.href = '/login';
    }
    throw error;
  }
};

// Post request API
// export const post = async (url, data) => {
//   const token = retrieveToken();
//   const response = await fetch(`${REACT_APP_API_URL}${url}`, {
//     method: 'POST',
//     headers: {
//       Authorization: `Bearer ${token}`,
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify(data)
//   });
//   return response.json();
// };

export { toUppercasePayload };

export const post = async (url, data) => {
  const token = retrieveToken();
  const companyId = localStorage.getItem('companyId');
  const isFormData = data instanceof FormData;
  const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
  
  const fullUrl = `${REACT_APP_API_URL}${cleanUrl}${cleanUrl.includes('?') ? '&' : '?'}companyId=${encodeURIComponent(companyId)}`;
  
  const response = await axios.post(fullUrl, isFormData ? data : convertBsonObjectIdToString(data), {
    headers: {
      Authorization: `Bearer ${token}`,
      ...(isFormData ? {} : { 'Content-Type': 'application/json' })
    }
  });

  return response.data;
};

export const put = async (url, data) => {
  const token = retrieveToken();
  const companyId = localStorage.getItem('companyId');
  const isFormData = data instanceof FormData;
  const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
  
  const fullUrl = `${REACT_APP_API_URL}${cleanUrl}${cleanUrl.includes('?') ? '&' : '?'}companyId=${encodeURIComponent(companyId)}`;

  const response = await axios.put(fullUrl, isFormData ? data : convertBsonObjectIdToString(data), {
    headers: {
      Authorization: `Bearer ${token}`,
      ...(isFormData ? {} : { 'Content-Type': 'application/json' })
    }
  });

  return response.data;
};

// Remove request API
export const remove = async (url) => {
  const token = retrieveToken();
  const companyId = localStorage.getItem('companyId');
  const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
  
  const fullUrl = `${REACT_APP_API_URL}${cleanUrl}${cleanUrl.includes('?') ? '&' : '?'}companyId=${encodeURIComponent(companyId)}`;

  try {
    const response = await axios.delete(fullUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// <<<<<<< HEAD
// Master's Api
// export const axiosInstance = axios.create({
//   baseURL: REACT_APP_API_URL,
//   // headers: {
//   //   'Content-Type': 'application/json'
//   // }
// });

// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = retrieveToken();
//     if (token) {
//       config.headers['Authorization'] = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );


// ==================== PAYMENT TRANSACTION APIS ====================

// Get all transactions
export const getTransactions = () => get('payment-transaction/get');

// Get transaction by ID
export const getTransactionById = (id) => get(`payment-transaction/get/${id}`);

// Add new transaction
export const addTransaction = (data) => post('payment-transaction/add', data);

// Update transaction
export const updateTransaction = (id, data) => put(`payment-transaction/update/${id}`, data);

// Delete transaction
export const deleteTransaction = (id) => remove(`payment-transaction/delete/${id}`);





