import axios from 'axios';
import { tokenService } from '../utils/tokenService';

const API_URL = 'http://localhost:8080/order';

// Create axios instance with auth header
const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 5000,
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

// Create new order
export const createOrder = async (orderData) => {
    try {
        const response = await axiosInstance.post('/create', orderData);
        return response.data;
    } catch (error) {
        console.error('Error creating order:', error);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        } else if (error.request) {
            console.error('Request made but no response received');
        } else {
            console.error('Error setting up request:', error.message);
        }
        throw error;
    }
};

// Get user's orders
export const getUserOrders = async (page = 1, size = 10) => {
    try {
        const response = await axiosInstance.get(`/user/list?page=${page}&size=${size}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user orders:', error);
        throw error;
    }
};

// Get order details
export const getOrderDetails = async (orderId) => {
    try {
        // Lấy thông tin cơ bản của đơn hàng
        const orderResponse = await axiosInstance.get(`/${orderId}`);
        const orderData = orderResponse.data?.data;

        if (!orderData) {
            throw new Error('Invalid order data response');
        }

        // Lấy chi tiết đơn hàng với thông tin sản phẩm
        const detailsResponse = await axiosInstance.get(`/details/${orderId}`);
        const orderDetails = detailsResponse.data?.data || [];

        // Kết hợp dữ liệu
        return {
            ...orderData,
            orderDetails: orderDetails
        };
    } catch (error) {
        console.error('Error fetching order details:', error);
        throw error;
    }
};

// Cancel order
export const cancelOrder = async (orderId) => {
    try {
        const response = await axiosInstance.put(`/${orderId}/cancel`);
        return response.data;
    } catch (error) {
        console.error('Error canceling order:', error);
        throw error;
    }
}; 