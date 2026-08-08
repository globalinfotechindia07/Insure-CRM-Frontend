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

// const REACT_APP_API_URL = 'https://miraicrm.com/api/';
// const REACT_APP_API_URL = 'https://insure.isyncerp.com/api/';
// const REACT_APP_API_URL = 'https://jpinsurancebroker.co.in/api/'; 
const REACT_APP_API_URL = 'http://localhost:5050/api/';
// const REACT_APP_API_URL = 'https://grampanchayattigaon/api/'; 
// const REACT_APP_API_URL = 'https://insure-crm-backend-1-n420.onrender.com/api/';



export default REACT_APP_API_URL;
//  REACT_APP_API_URL;

// Get token
export const retrieveToken = () => {
  let token = '';
  document.cookie.split('; ').forEach((v) => {
    if (v.split('=')[0] === 'hmsToken') {
      token = v.split('=')[1];
    }
  });
  if (!token) {
    token = localStorage.getItem('token') || '';
  }
  return token;
};

// Get request API
export const get = async (url) => {
  const token = retrieveToken();
  const companyId = localStorage.getItem('companyId');
  const response = await fetch(`${REACT_APP_API_URL}${url}${url.includes('?') ? '&' : '?'}companyId=${encodeURIComponent(companyId)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const json = await response.json();
  return convertBsonObjectIdToString(json);
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
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(isFormData ? {} : { 'Content-Type': 'application/json' })
  };

  const response = await fetch(`${REACT_APP_API_URL}${url}${url.includes('?') ? '&' : '?'}companyId=${encodeURIComponent(companyId)}`, {
    method: 'POST',
    headers,
    body: isFormData ? data : JSON.stringify(convertBsonObjectIdToString(data))
  });

  if (response.status === 401) {
    throw new Error('Unauthorized');
  }

  const json = await response.json();
  return convertBsonObjectIdToString(json);
};

export const put = async (url, data) => {
  const token = retrieveToken();
  const companyId = localStorage.getItem('companyId');
  const isFormData = data instanceof FormData;
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(isFormData ? {} : { 'Content-Type': 'application/json' })
  };

  const response = await fetch(`${REACT_APP_API_URL}${url}${url.includes('?') ? '&' : '?'}companyId=${encodeURIComponent(companyId)}`, {
    method: 'PUT',
    headers,
    body: isFormData ? data : JSON.stringify(convertBsonObjectIdToString(data))
  });

  if (response.status === 401) throw new Error('Unauthorized');
  const json = await response.json();
  return convertBsonObjectIdToString(json);
};

// Remove request API
export const remove = async (url, ids) => {
  const token = retrieveToken();
  console.log(ids);

  const response = await axios.delete(`${REACT_APP_API_URL}${url}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    data: { ids: ids } // Send `ids` directly in the `data` field
  });

  return response.data;
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





