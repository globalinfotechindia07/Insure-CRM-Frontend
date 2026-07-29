 const API_BASE_URL = 'http://localhost:5050/api'; 
// const API_BASE_URL = "https://insure-crm-backend-1-n420.onrender.com/api";


// ==================== COMPANY API FUNCTIONS ====================

/**
 * Get all companies
 * @returns {Promise} - Returns all companies data
 */
export const getCompanies = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/company`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch companies');
        }
        
        return data;
    } catch (error) {
        console.error('Error fetching companies:', error);
        throw error;
    }
};

/**
 * Get active companies (for dropdown)
 * @returns {Promise} - Returns only active companies
 */
export const getActiveCompanies = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/company/active`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch active companies');
        }
        
        return data;
    } catch (error) {
        console.error('Error fetching active companies:', error);
        throw error;
    }
};

/**
 * Get single company by ID
 * @param {string} id - Company ID
 * @returns {Promise} - Returns single company data
 */
export const getCompanyById = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/company/${id}`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch company');
        }
        
        return data;
    } catch (error) {
        console.error('Error fetching company:', error);
        throw error;
    }
};

/**
 * Create new company
 * @param {Object} data - Company data { name, description }
 * @returns {Promise} - Returns created company data
 */
export const createCompany = async (data) => {
    try {
        const response = await fetch(`${API_BASE_URL}/company`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const responseData = await response.json();
        
        if (!response.ok) {
            throw new Error(responseData.message || 'Failed to create company');
        }
        
        return responseData;
    } catch (error) {
        console.error('Error creating company:', error);
        throw error;
    }
};

/**
 * Update company
 * @param {string} id - Company ID
 * @param {Object} data - Company data { name, description, status }
 * @returns {Promise} - Returns updated company data
 */
export const updateCompany = async (id, data) => {
    try {
        const response = await fetch(`${API_BASE_URL}/company/${id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const responseData = await response.json();
        
        if (!response.ok) {
            throw new Error(responseData.message || 'Failed to update company');
        }
        
        return responseData;
    } catch (error) {
        console.error('Error updating company:', error);
        throw error;
    }
};

/**
 * Delete company
 * @param {string} id - Company ID
 * @returns {Promise} - Returns deletion status
 */
export const deleteCompany = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/company/${id}`, {
            method: 'DELETE',
        });
        
        const responseData = await response.json();
        
        if (!response.ok) {
            throw new Error(responseData.message || 'Failed to delete company');
        }
        
        return responseData;
    } catch (error) {
        console.error('Error deleting company:', error);
        throw error;
    }
};

// ==================== EXPORT ALL FUNCTIONS ====================
export default {
    getCompanies,
    getActiveCompanies,
    getCompanyById,
    createCompany,
    updateCompany,
    deleteCompany
};