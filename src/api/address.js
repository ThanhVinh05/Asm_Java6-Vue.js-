import axios from 'axios';
import { axiosInstance, API_URL } from './config';

const PROVINCE_API_URL = 'https://provinces.open-api.vn/api/p';

// Lấy danh sách tỉnh/thành phố
export const getProvinces = async () => {
    try {
        const response = await axios.get(PROVINCE_API_URL);
        return response.data;
    } catch (error) {
        console.error('Error fetching provinces:', error);
        throw error;
    }
};

// Lấy danh sách quận/huyện theo tỉnh/thành phố
export const getDistricts = async (provinceCode) => {
    try {
        console.log(`Đang gọi API lấy quận/huyện cho tỉnh/thành phố ${provinceCode}`);
        const response = await axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
        
        if (response.data && response.data.districts) {
            console.log(`Lấy thành công ${response.data.districts.length} quận/huyện`);
            return response.data.districts;
        } else {
            console.error('API trả về dữ liệu không đúng định dạng:', response.data);
            throw new Error('Dữ liệu quận/huyện không đúng định dạng');
        }
    } catch (error) {
        console.error('Error fetching districts:', error);
        console.error('Response:', error.response);
        // Trả về mảng trống để tránh lỗi ở UI
        return [];
    }
};

// Lấy danh sách phường/xã theo quận/huyện
export const getWards = async (districtCode) => {
    try {
        console.log(`Đang gọi API lấy phường/xã cho quận/huyện ${districtCode}`);
        const response = await axios.get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
        
        if (response.data && response.data.wards) {
            console.log(`Lấy thành công ${response.data.wards.length} phường/xã`);
            return response.data.wards;
        } else {
            console.error('API trả về dữ liệu không đúng định dạng:', response.data);
            throw new Error('Dữ liệu phường/xã không đúng định dạng');
        }
    } catch (error) {
        console.error('Error fetching wards:', error);
        console.error('Response:', error.response);
        // Trả về mảng trống để tránh lỗi ở UI
        return [];
    }
};

// API lấy địa chỉ người dùng
export const getUserAddresses = async () => {
    try {
        const response = await axiosInstance.get(`${API_URL}/address/list`);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching user addresses:', error);
        throw error.response?.data?.message || "Không thể lấy thông tin địa chỉ";
    }
};

// API cập nhật địa chỉ người dùng
export const updateUserAddress = async (addresses) => {
    try {
        console.log('Sending address update request:', addresses);
        const response = await axiosInstance.put(`${API_URL}/address/upd`, addresses);
        return response.data;
    } catch (error) {
        console.error('Error updating user address:', error);
        throw error.response?.data?.message || "Không thể cập nhật địa chỉ";
    }
};