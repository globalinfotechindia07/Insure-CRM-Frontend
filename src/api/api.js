import axios from 'axios';

// const REACT_APP_API_URL = 'https://miraicrm.com/api/';
// const REACT_APP_API_URL = 'https://insure.isyncerp.com/api/';
// const REACT_APP_API_URL = 'https://jpinsurancebroker.co.in/api/';
const REACT_APP_API_URL = 'http://localhost:5050/api/';
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
  return token;
};

// Get request API
export const get = async (url) => {
  const token = retrieveToken();
  const companyId = localStorage.getItem('companyId');
  const response = await fetch(`${REACT_APP_API_URL}${url}?companyId=${encodeURIComponent(companyId)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
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

export const post = async (url, data) => {
  const token = retrieveToken();
  const companyId = localStorage.getItem('companyId');
  // console.log('Using Token (POST):', token);

  const isFormData = data instanceof FormData;
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    // DO NOT set Content-Type for FormData — browser will set the correct boundary.
    ...(isFormData ? {} : { 'Content-Type': 'application/json' })
  };

  const response = await fetch(`${REACT_APP_API_URL}${url}?companyId=${encodeURIComponent(companyId)}`, {
    method: 'POST',
    headers,
    body: isFormData ? data : JSON.stringify(data)
  });

  // optional: helper behavior for 401 so component can catch it
  if (response.status === 401) {
    // either return JSON with error or throw — we'll throw so UI can handle it
    throw new Error('Unauthorized');
  }

  return response.json();
};

// Update request API
// export const put = async (url, data) => {
//   const token = retrieveToken();
//   const response = await fetch(`${REACT_APP_API_URL}${url}`, {
//     method: 'PUT',
//     headers: {
//       Authorization: `Bearer ${token}`,
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify(data)
//   });
//   return response.json();
// };

export const put = async (url, data) => {
  const token = retrieveToken();
  const companyId = localStorage.getItem('companyId');
  const isFormData = data instanceof FormData;
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(isFormData ? {} : { 'Content-Type': 'application/json' })
  };

  const response = await fetch(`${REACT_APP_API_URL}${url}?companyId=${encodeURIComponent(companyId)}`, {
    method: 'PUT',
    headers,
    body: isFormData ? data : JSON.stringify(data)
  });

  if (response.status === 401) throw new Error('Unauthorized');
  return response.json();
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





