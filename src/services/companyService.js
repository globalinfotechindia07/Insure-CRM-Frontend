// const API_BASE_URL = 'http://localhost:5050/api'; 
// const API_BASE_URL = 'https://insure-crm-backend-1-n420.onrender.com/api';
const API_BASE_URL = 'https://api.jpinsurancebrokers.co.in';

// ==================== COMPANY API FUNCTIONS (INS COMPANY MASTER) ====================

const getCompanyId = () => {
  return localStorage.getItem('companyId') || '68ca95091d6a9cc2b96ae263';
};

/**
 * Get all insurance companies
 * @returns {Promise} - Returns all insCompany master data
 */
export const getCompanies = async () => {
    try {
        const companyId = getCompanyId();
        const response = await fetch(`${API_BASE_URL}/insCompany?companyId=${companyId}`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch companies');
        }

        // Standardize properties for UI rendering
        const items = (data.data || []).map(item => ({
            ...item,
            name: item.insCompany || item.name || '',
            description: item.description || '',
            status: item.status || 'active'
        }));
        
        return { ...data, data: items };
    } catch (error) {
        console.error('Error fetching companies:', error);
        throw error;
    }
};

/**
 * Get active companies (for dropdown)
 * @returns {Promise} - Returns active companies
 */
export const getActiveCompanies = async () => {
    return getCompanies();
};

/**
 * Get single company by ID
 * @param {string} id - Company ID
 * @returns {Promise} - Returns single company data
 */
export const getCompanyById = async (id) => {
    try {
        const companyId = getCompanyId();
        const response = await fetch(`${API_BASE_URL}/insCompany?companyId=${companyId}`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch company');
        }
        
        const found = (data.data || []).find(item => item._id === id);
        return {
            status: 'true',
            data: found ? { ...found, name: found.insCompany || found.name || '' } : null
        };
    } catch (error) {
        console.error('Error fetching company:', error);
        throw error;
    }
};

/**
 * Create new company in insCompany master
 * @param {Object} data - Company data { name, description }
 * @returns {Promise} - Returns created company data
 */
export const createCompany = async (data) => {
    try {
        const companyId = getCompanyId();
        const compName = data.name || data.insCompany || '';
        const response = await fetch(`${API_BASE_URL}/insCompany?companyId=${companyId}`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                insCompany: compName,
                companyId
            })
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
 * Update company in insCompany master
 * @param {string} id - Company ID
 * @param {Object} data - Company data { name, description, status }
 * @returns {Promise} - Returns updated company data
 */
export const updateCompany = async (id, data) => {
    try {
        const compName = data.name || data.insCompany || '';
        const response = await fetch(`${API_BASE_URL}/insCompany/${id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                insCompany: compName
            })
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
 * Delete company from insCompany master
 * @param {string} id - Company ID
 * @returns {Promise} - Returns deletion status
 */
export const deleteCompany = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/insCompany/${id}`, {
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