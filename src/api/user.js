import axios from "axios";
import { tokenService } from '/src/utils/tokenService';
import { userStore } from '../store/userStore';
import { cartStore } from '../store/cartStore';

const API_URL = "http://localhost:8080";

// Tạo axios instance với interceptor
const axiosInstance = axios.create({
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

axiosInstance.interceptors.response.use(
    response => response,
    error => {
        if (!error.response) {
            // Network error
            console.error('Network Error:', error);
            throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
        }
        return Promise.reject(error);
    }
);

export const register = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/user/add`, userData);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.";
    }
};

export const confirmEmail = async (secretCode) => {
    try {
        const response = await axios.get(`${API_URL}/user/confirm-email?secretCode=${secretCode}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Xác nhận email thất bại.";
    }
};

export const login = async (credentials) => {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, credentials);
        if (response.data && response.data.accessToken) {
            tokenService.setToken(response.data.accessToken);
            
            const userData = tokenService.parseJwt(response.data.accessToken);
            const userInfo = {
                accessToken: response.data.accessToken,
                username: userData.sub,
                userId: userData.userId,
                role: userData.role
            };
            
            // Cập nhật trạng thái người dùng ngay lập tức
            userStore.setUserInfo(userInfo.username, userInfo.role);
            
            // Khởi tạo giỏ hàng ngay sau khi đăng nhập
            await cartStore.initializeCart();
            
            return userInfo;
        }
        throw new Error("Đăng nhập thất bại");
    } catch (error) {
        throw error.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại.";
    }
};

export const logout = async () => {
    try {
        await axiosInstance.post(`${API_URL}/auth/logout`);
        tokenService.removeToken();
        return "Đăng xuất thành công.";
    } catch (error) {
        throw error.response?.data?.message || "Đăng xuất thất bại.";
    }
};

export const getUserProfile = async () => {
    try {
        const token = tokenService.getToken();
        if (!token) {
            throw new Error("Chưa đăng nhập");
        }

        // Decode token để lấy thông tin cơ bản
        const userData = tokenService.parseJwt(token);

        // Gọi API để lấy thông tin chi tiết
        const response = await axiosInstance.get(`${API_URL}/user/profile`);
        
        // Log response để debug
        console.log('Profile response:', response);

        // Kiểm tra cấu trúc response và lấy data
        const profileData = response.data?.data || response.data;
        
        if (!profileData) {
            throw new Error("Không tìm thấy thông tin người dùng");
        }

        return {
            ...profileData,
            username: userData.sub,
            role: userData.role
        };
    } catch (error) {
        console.error("Error in getUserProfile:", error);
        throw error.response?.data?.message || "Không thể lấy thông tin người dùng";
    }
};

// API cập nhật thông tin người dùng
export const updateUserProfile = async (profileData) => {
    try {
        const response = await axiosInstance.put(`${API_URL}/user/upd`, profileData);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Cập nhật thông tin thất bại";
    }
};

// Google Authentication
export const loginWithGoogle = async (googleToken) => {
    try {
        const response = await axios.post(`${API_URL}/auth/google`, { token: googleToken });
        if (response.data && response.data.accessToken) {
            tokenService.setToken(response.data.accessToken);
            
            const userData = tokenService.parseJwt(response.data.accessToken);
            const userInfo = {
                accessToken: response.data.accessToken,
                username: userData.sub,
                userId: userData.userId,
                role: userData.role
            };
            
            userStore.setUserInfo(userInfo.username, userInfo.role);
            await cartStore.initializeCart();
            
            return userInfo;
        }
        throw new Error("Đăng nhập Google thất bại");
    } catch (error) {
        throw error.response?.data?.message || "Đăng nhập Google thất bại. Vui lòng thử lại.";
    }
};
