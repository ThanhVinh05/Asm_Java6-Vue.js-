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
        console.log("Sending Google token to backend:", googleToken);
        // Gọi đến endpoint /auth/google của backend
        const response = await axios.post(`${API_URL}/auth/google`, { token: googleToken });

        console.log("Backend Google login response:", response.data);

        if (response.data && response.data.accessToken) {
            // Lưu token nhận được từ backend
            tokenService.setToken(response.data.accessToken);

            // Parse thông tin user từ token của backend
            const userData = tokenService.parseJwt(response.data.accessToken);
            const userInfo = {
                accessToken: response.data.accessToken,
                username: userData.sub,
                userId: userData.userId,
                role: userData.role
            };

            // Cập nhật store (nếu dùng)
            userStore.setUserInfo(userInfo.username, userInfo.role);
            await cartStore.initializeCart();

            return userInfo; // Trả về thông tin user đã đăng nhập
        }
        throw new Error("Đăng nhập Google thất bại từ backend");
    } catch (error) {
        console.error('Error logging in with Google via backend:', error);
        throw error.response?.data?.message || "Đăng nhập Google thất bại. Vui lòng thử lại.";
    }
};

// Lấy danh sách người dùng
export const getUsers = async (page = 1, size = 20, keyword = null, sort = null) => {
    try {
        let url = `${API_URL}/user/list?page=${page}&size=${size}`;
        
        if (keyword) {
            url += `&keyword=${encodeURIComponent(keyword)}`;
        }
        
        if (sort) {
            url += `&sort=${encodeURIComponent(sort)}`;
        }
        
        console.log('Fetching users from URL:', url);
        
        // Lấy token từ service
        const token = tokenService.getToken();
        console.log('Token for API call:', token ? `${token.substring(0, 10)}...` : 'No token');
        
        // Gọi API với token trong header
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Raw API response:', response);
        
        if (response.data && response.data.status === 200) {
            console.log('User data received:', response.data);
            return response.data.data;
        }
        
        return { users: [], totalElements: 0, totalPages: 0 };
    } catch (error) {
        console.error('Error fetching users:', error);
        console.error('Error response data:', error.response?.data);
        throw error.response?.data?.message || 'Không thể tải danh sách người dùng. Vui lòng thử lại sau.';
    }
};

// Lấy chi tiết người dùng
export const getUserDetail = async (userId) => {
    try {
        const token = tokenService.getToken();
        const response = await axios.get(`${API_URL}/user/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.data && response.data.status === 200) {
            return response.data.data;
        }
        
        throw new Error('Không nhận được dữ liệu người dùng');
    } catch (error) {
        console.error(`Error fetching user details for ID ${userId}:`, error);
        throw error.response?.data?.message || 'Không thể tải thông tin người dùng. Vui lòng thử lại sau.';
    }
};

// Cập nhật thông tin người dùng
export const updateUser = async (userData) => {
    try {
        const token = tokenService.getToken();
        const response = await axios.put(`${API_URL}/user/upd`, userData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.data && response.data.status === 202) {
            return true;
        }
        
        throw new Error(response.data?.message || 'Không thể cập nhật người dùng');
    } catch (error) {
        console.error('Error updating user:', error);
        throw error.response?.data?.message || 'Không thể cập nhật người dùng. Vui lòng thử lại sau.';
    }
};

// Thay đổi vai trò người dùng
export const updateUserRole = async (userId, role) => {
    try {
        // Lấy thông tin người dùng hiện tại
        const userDetail = await getUserDetail(userId);
        
        console.log('Current user detail before update:', userDetail);
        console.log('Updating user ID:', userId, 'with new role:', role);
        
        // Cập nhật vai trò - Sử dụng type thay vì role vì UserEntity sử dụng trường type
        const userData = {
            ...userDetail,
            id: userId,
            type: role // Thay đổi từ role thành type để match với model UserEntity
        };
        
        console.log('User data to be sent for update:', userData);
        
        // Gọi API cập nhật
        const response = await updateUser(userData);
        return response;
    } catch (error) {
        console.error(`Error updating role for user ID ${userId}:`, error);
        throw error.response?.data?.message || 'Không thể cập nhật vai trò người dùng. Vui lòng thử lại sau.';
    }
};

// Thay đổi trạng thái người dùng (kích hoạt/vô hiệu hóa)
export const updateUserStatus = async (userId, status) => {
    try {
        // Lấy thông tin người dùng hiện tại
        const userDetail = await getUserDetail(userId);
        
        // Cập nhật trạng thái
        const userData = {
            ...userDetail,
            id: userId,
            status: status
        };
        
        // Gọi API cập nhật
        const response = await updateUser(userData);
        return response;
    } catch (error) {
        console.error(`Error updating status for user ID ${userId}:`, error);
        throw error.response?.data?.message || 'Không thể cập nhật trạng thái người dùng. Vui lòng thử lại sau.';
    }
};

// Xóa người dùng
export const deleteUser = async (userId) => {
    try {
        const token = tokenService.getToken();
        const response = await axios.delete(`${API_URL}/user/del/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.data && response.data.status === 205) {
            return true;
        }
        
        throw new Error(response.data?.message || 'Không thể xóa người dùng');
    } catch (error) {
        console.error(`Error deleting user ID ${userId}:`, error);
        throw error.response?.data?.message || 'Không thể xóa người dùng. Vui lòng thử lại sau.';
    }
};

// Lấy thông tin người dùng hiện tại (đã đăng nhập)
export const getCurrentUser = async () => {
    try {
        const token = tokenService.getToken();
        const response = await axios.get(`${API_URL}/user/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.data && response.data.status === 200) {
            return response.data.data;
        }
        
        throw new Error('Không nhận được dữ liệu người dùng');
    } catch (error) {
        console.error('Error fetching current user:', error);
        throw error.response?.data?.message || 'Không thể tải thông tin người dùng. Vui lòng thử lại sau.';
    }
};

// Lấy danh sách đơn hàng của người dùng
export const getUserOrders = async (userId) => {
    try {
        console.log('getUserOrders API called with userId:', userId);
        const token = tokenService.getToken();
        
        if (!token) {
            console.error('No token available for API call');
            return [];
        }

        console.log('Using token for API call:', token.substring(0, 10) + '...');
        console.log('API URL:', `http://localhost:8080/order/user/${userId}`);
        
        const response = await axios.get(`http://localhost:8080/order/user/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('API getUserOrders raw response:', response);
        
        if (response.data && response.data.status === 200) {
            console.log('Data from API:', response.data);
            // Kiểm tra nhiều định dạng phản hồi có thể có
            if (response.data.data) {
                if (Array.isArray(response.data.data)) {
                    console.log('Returning array of orders:', response.data.data);
                    return response.data.data;
                } else if (response.data.data.content && Array.isArray(response.data.data.content)) {
                    console.log('Returning paginated orders:', response.data.data.content);
                    return response.data.data.content;
                } else {
                    console.log('Returning single order as array:', [response.data.data]);
                    return [response.data.data];
                }
            }
        }
        
        console.log('No valid data found, returning empty array');
        return [];
    } catch (error) {
        console.error(`Error fetching orders for user ID ${userId}:`, error);
        console.error('Error response:', error.response?.data);
        return [];
    }
};
