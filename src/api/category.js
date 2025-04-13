import axios from 'axios';
import { tokenService } from '../utils/tokenService';

const API_URL = 'http://localhost:8080/category';

// Configure Axios to include authorization headers automatically
axios.interceptors.request.use(
    config => {
        const token = tokenService.getToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Lấy danh sách tất cả danh mục
export const getCategories = async () => {
    try {
        console.log('Fetching categories...');
        
        // Kiểm tra token trước khi gọi API
        const token = tokenService.getToken();
        if (!token || tokenService.isTokenExpired()) {
            console.error('Token không hợp lệ hoặc đã hết hạn');
            throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        
        const response = await axios.get(`${API_URL}/list`);
        console.log('Categories API response:', response);
        return response.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        
        // Kiểm tra lỗi 401 Unauthorized
        if (error.response && error.response.status === 401) {
            // Xóa token nếu hết hạn và yêu cầu đăng nhập lại
            tokenService.removeToken();
            throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        
        throw error.response?.data?.message || 'Không thể tải danh mục. Vui lòng thử lại sau.';
    }
};

// Lấy chi tiết danh mục
export const getCategory = async (categoryId) => {
    try {
        const response = await axios.get(`${API_URL}/${categoryId}`);
        return response.data.data;
    } catch (error) {
        console.error(`Error fetching category detail for ID ${categoryId}:`, error);
        throw error.response?.data?.message || 'Không thể tải thông tin danh mục. Vui lòng thử lại sau.';
    }
};

// Tạo danh mục mới
export const createCategory = async (categoryData) => {
    try {
        const response = await axios.post(`${API_URL}/add`, categoryData);
        return response.data;
    } catch (error) {
        console.error('Error creating category:', error);
        throw error.response?.data?.message || 'Không thể tạo danh mục. Vui lòng thử lại sau.';
    }
};

// Cập nhật danh mục
export const updateCategory = async (categoryId, categoryData) => {
    try {
        const data = { ...categoryData, id: categoryId };
        const response = await axios.put(`${API_URL}/upd`, data);
        return response.data;
    } catch (error) {
        console.error(`Error updating category ID ${categoryId}:`, error);
        throw error.response?.data?.message || 'Không thể cập nhật danh mục. Vui lòng thử lại sau.';
    }
};

// Xóa danh mục
export const deleteCategory = async (categoryId) => {
    try {
        const response = await axios.delete(`${API_URL}/del/${categoryId}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting category ID ${categoryId}:`, error);
        throw error.response?.data?.message || 'Không thể xóa danh mục. Vui lòng thử lại sau.';
    }
};