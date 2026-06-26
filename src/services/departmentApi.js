// const API_BASE_URL = 'http://localhost:5050/api';
const API_BASE_URL = "https://insure-crm-backend-1-n420.onrender.com/api";


export const getDepartments = async () => {
    const response = await fetch(`${API_BASE_URL}/department`);
    return response.json();
};

export const createDepartment = async (data) => {
    const response = await fetch(`${API_BASE_URL}/department`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return response.json();
};

export const updateDepartment = async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/department/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return response.json();
};

export const deleteDepartment = async (id) => {
    const response = await fetch(`${API_BASE_URL}/department/${id}`, {
        method: 'DELETE'
    });
    return response.json();
};

export const getActiveDepartments = async () => {
    const response = await fetch(`${API_BASE_URL}/department/active`);
    return response.json();
};