import axios from 'axios';
import { tokenService } from '../utils/tokenService';

const API_URL = 'http://localhost:8080/cart';

// Create axios instance with auth header
const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    retries: 3,
    retryDelay: 1000,
});

// Add auth token to requests
axiosInstance.interceptors.request.use(
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

// Add retry logic
axiosInstance.interceptors.response.use(undefined, async (err) => {
    const { config } = err;
    if (!config || !config.retries) return Promise.reject(err);
    
    config.retryCount = config.retryCount || 0;
    
    if (config.retryCount >= config.retries) {
        return Promise.reject(err);
    }
    
    config.retryCount += 1;
    const backoff = new Promise(resolve => {
        setTimeout(() => resolve(), config.retryDelay || 1000);
    });
    
    await backoff;
    return axiosInstance(config);
});

// Get cart items
export const getCartItems = async () => {
    try {
        const response = await axiosInstance.get('/items');
        return response.data.data || [];
    } catch (error) {
        console.error('Error fetching cart items:', error);
        if (error.code === 'ERR_NETWORK') {
            throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
        }
        if (error.response?.status === 401) {
            tokenService.removeToken();
            throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        throw error.response?.data?.message || 'Không thể lấy thông tin giỏ hàng';
    }
};

// Add item to cart
export const addToCart = async (productId, quantity) => {
    try {
        // First check if the product is in stock
        const productResponse = await axios.get(`http://localhost:8080/product/${productId}`);
        if (!productResponse.data || !productResponse.data.data) {
            throw new Error('Không thể lấy thông tin sản phẩm');
        }
        
        const productData = productResponse.data.data;
        if (productData.stockQuantity <= 0) {
            throw new Error('Sản phẩm này đã hết hàng. Vui lòng chọn sản phẩm khác.');
        }
        
        // If product is available, add to cart
        const response = await axiosInstance.post('/add', {
            productId: productId,
            quantity: quantity
        });
        return response.data;
    } catch (error) {
        console.error('Error adding to cart:', error);
        if (error.response?.status === 401) {
            tokenService.removeToken();
            throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        throw error.response?.data?.message || error.message || 'Không thể thêm vào giỏ hàng';
    }
};

// Update cart item quantity
export const updateCartItem = async (productId, quantity) => {
    try {
        const response = await axiosInstance.put('/update', {
            productId,
            quantity
        });
        return response.data;
    } catch (error) {
        console.error('Error updating cart item:', error);
        if (error.response?.status === 401) {
            tokenService.removeToken();
            throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        throw error.response?.data?.message || 'Không thể cập nhật số lượng';
    }
};

// Remove item from cart
export const removeFromCart = async (productId) => {
    try {
        const response = await axiosInstance.delete(`/remove/${productId}`);
        return response.data;
    } catch (error) {
        console.error('Error removing item from cart:', error);
        if (error.response?.status === 401) {
            tokenService.removeToken();
            throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        throw error.response?.data?.message || 'Không thể xóa sản phẩm khỏi giỏ hàng';
    }
};

// Clear cart
export const clearCart = async () => {
    try {
        const response = await axiosInstance.delete('/clear');
        return response.data;
    } catch (error) {
        console.error('Error clearing cart:', error);
        if (error.response?.status === 401) {
            tokenService.removeToken();
            throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        throw error.response?.data?.message || 'Không thể xóa giỏ hàng';
    }
}; 