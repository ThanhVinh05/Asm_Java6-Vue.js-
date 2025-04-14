import axios from 'axios';
import { tokenService } from '../utils/tokenService';

const API_URL = 'http://localhost:8080/product'; // Thay đổi URL nếu cần

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

//Trang home
export const getFeaturedProducts = async () => {
    try {
        const response = await axios.get(`${API_URL}/list?page=0&size=8`); // Lấy 8 sản phẩm đầu tiên
        return response.data.data.products; // Trả về mảng sản phẩm
    } catch (error) {
        console.error('Error fetching featured products:', error);
        if (error.code === 'ERR_NETWORK') {
            throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.');
        }
        throw error.response?.data?.message || 'Không thể tải sản phẩm. Vui lòng thử lại sau.';
    }
};

// Trang Shop
export const getProducts = async (page = 1, size = 6, categoryId = null, keyword = null, minPrice = null, maxPrice = null, sort = null) => {
    try {
        let url = `${API_URL}/list?page=${page}&size=${size}`;
        if (categoryId) {
            url += `&categoryId=${categoryId}`;
        }
        if (keyword) {
            url += `&keyword=${encodeURIComponent(keyword)}`;
        }
        if (minPrice !== null) {
            url += `&minPrice=${minPrice}`;
        }
        if (maxPrice !== null) {
            url += `&maxPrice=${maxPrice}`;
        }
        if (sort) {
            url += `&sort=${sort}`;
        }
        console.log(`Fetching products from URL: ${url}`);
        const response = await axios.get(url);
        return response.data.data; // Trả về toàn bộ dữ liệu phân trang
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
};

// API lấy danh sách categories 
export const getCategories = async () => {
    try {
        const response = await axios.get('http://localhost:8080/category/list');
        return response.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

// Trang Product Detail
export const getProductDetail = async (productId) => {
    try {
        const response = await axios.get(`${API_URL}/${productId}`);
        return response.data.data; // Trả về chi tiết sản phẩm
    } catch (error) {
        console.error(`Error fetching product detail for ID ${productId}:`, error);
        throw error;
    }
};

// Tạo sản phẩm mới
export const createProduct = async (productData) => {
    try {
        const response = await axios.post(`${API_URL}/add`, productData);
        console.log('API Response:', response);
        
        // Handle nested response structure
        if (response.data && response.data.status === 201) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Không có dữ liệu từ server');
        }
    } catch (error) {
        console.error('Error creating product:', error);
        
        // Provide more detailed error information
        const errorMessage = error.response?.data?.message || 
                            error.message || 
                            'Không thể tạo sản phẩm. Vui lòng thử lại sau.';
        
        throw new Error(errorMessage);
    }
};

// Cập nhật sản phẩm
export const updateProduct = async (productId, productData) => {
    try {
        // Gắn ID vào data để gửi lên server
        const data = { ...productData, id: productId };
        const response = await axios.put(`${API_URL}/upd`, data);
        console.log('API Response (update):', response);
        
        // Handle nested response structure
        if (response.data && response.data.status === 202) {
            // Return the updated product data - since API doesn't return it,
            // we'll return what we sent
            return data;
        } else {
            throw new Error(response.data.message || 'Không có dữ liệu từ server');
        }
    } catch (error) {
        console.error(`Error updating product ID ${productId}:`, error);
        
        // Provide more detailed error information
        const errorMessage = error.response?.data?.message || 
                           error.message || 
                           'Không thể cập nhật sản phẩm. Vui lòng thử lại sau.';
        
        throw new Error(errorMessage);
    }
};

// Xóa sản phẩm
export const deleteProduct = async (productId) => {
    try {
        const response = await axios.delete(`${API_URL}/del/${productId}`);
        
        if (response.data && response.data.status === 205) {
            return true;
        } else {
            throw new Error(response.data.message || 'Không có phản hồi từ server');
        }
    } catch (error) {
        console.error(`Error deleting product ID ${productId}:`, error);
        throw error.response?.data?.message || 'Không thể xóa sản phẩm. Vui lòng thử lại sau.';
    }
};

// Get products by category ID for counting
export const getProductsByCategory = async (categoryId) => {
    try {
        console.log(`Fetching products for category ID ${categoryId}...`);
        const response = await axios.get(`${API_URL}/list?categoryId=${categoryId}`);
        
        if (response.data && response.data.data) {
            console.log(`Found ${response.data.data.products?.length || 0} products for category ${categoryId}`);
            return response.data.data.products || [];
        }
        
        return [];
    } catch (error) {
        console.error(`Error fetching products for category ${categoryId}:`, error);
        return [];
    }
};

// Update product stock quantity when order is shipped
export const updateProductStock = async (productId, quantity) => {
    try {
        // First, get the current product data
        const productResponse = await axios.get(`${API_URL}/${productId}`);
        if (!productResponse.data || !productResponse.data.data) {
            throw new Error('Không thể lấy thông tin sản phẩm');
        }
        
        const productData = productResponse.data.data;
        
        // Calculate new quantity (ensure it doesn't go below 0)
        const currentStock = productData.stockQuantity || 0;
        const newStock = Math.max(0, currentStock - quantity);
        
        console.log(`Updating product ${productId} stock: ${currentStock} -> ${newStock}`);
        
        // Update the product with new stock quantity
        const updateData = {
            ...productData,
            stockQuantity: newStock
        };
        
        const response = await axios.put(`${API_URL}/upd`, updateData);
        
        if (response.data && response.data.status === 202) {
            return {
                success: true,
                previousStock: currentStock,
                newStock: newStock,
                productName: productData.productName
            };
        } else {
            throw new Error(response.data.message || 'Không thể cập nhật số lượng sản phẩm');
        }
    } catch (error) {
        console.error(`Error updating product ${productId} stock:`, error);
        throw error.response?.data?.message || 'Không thể cập nhật số lượng sản phẩm trong kho';
    }
};