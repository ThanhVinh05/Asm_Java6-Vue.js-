import axios from "axios";
import { tokenService } from '../utils/tokenService';
import { userStore } from '../store/userStore';
import { cartStore } from '../store/cartStore';
import { useRouter } from 'vue-router';

export const API_URL = "http://localhost:8080";

// Tạo axios instance với interceptor
export const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 5000, // Timeout sau 5 giây
});

// Add request interceptor
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

// Add response interceptor
axiosInstance.interceptors.response.use(
    response => response,
    error => {
        if (!error.response) {
            // Network error
            console.error('Network Error:', error);
            throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
        }

        // Check for token expiration
        if (error.response.status === 401) {
            // Token expired or invalid
            tokenService.removeToken();
            userStore.clearUserInfo();
            cartStore.resetCart();
            
            // Redirect to login page
            window.location.href = '/login';
        }
        
        return Promise.reject(error);
    }
); 