import { get, post, put, remove } from '../api/api';

// ================= PRODUCT/SERVICE CATEGORY API =================

// Get all product categories
export const getProductCategories = async () => {
    try {
        const response = await get('productOrServiceCategory');
        console.log('Get Product Categories Response:', response);
        return response;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

// Create new product category
export const createProductCategory = async (data) => {
    try {
        const response = await post('productOrServiceCategory', data);
        console.log('Create Product Category Response:', response);
        return response;
    } catch (error) {
        console.error('Error creating category:', error);
        throw error;
    }
};

// Update product category
export const updateProductCategory = async (id, data) => {
    try {
        const response = await put(`productOrServiceCategory/${id}`, data);
        console.log('Update Product Category Response:', response);
        return response;
    } catch (error) {
        console.error('Error updating category:', error);
        throw error;
    }
};

// Delete product category
export const deleteProductCategory = async (id) => {
    try {
        const response = await remove(`productOrServiceCategory/${id}`);
        console.log('Delete Product Category Response:', response);
        return response;
    } catch (error) {
        console.error('Error deleting category:', error);
        throw error;
    }
};