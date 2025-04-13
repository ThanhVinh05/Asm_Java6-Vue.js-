import axios from 'axios';
import { tokenService } from '../utils/tokenService';

const API_URL = "http://localhost:8080";
const ADDRESS_API_URL = "https://vn-public-apis.fpo.vn";

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

// Cache object
const addressCache = {
    provinces: null,
    districts: {},
    wards: {}
};

// Hàm thêm tiền tố cho tỉnh/thành phố
const formatProvinceName = (province) => {
    if (!province) return '';
    
    const specialCities = ['Hà Nội', 'Hồ Chí Minh', 'Hải Phòng', 'Đà Nẵng', 'Cần Thơ'];
    if (specialCities.includes(province.name)) {
        return {
            ...province,
            displayName: `Thành phố ${province.name}`
        };
    }
    
    return {
        ...province,
        displayName: `Tỉnh ${province.name}`
    };
};

// Hàm thêm tiền tố cho quận/huyện
const formatDistrictName = (district) => {
    if (!district) return '';
    
    // Xác định tiền tố dựa vào type hoặc name (nếu có trong data)
    let prefix = 'Huyện';
    
    if (district.type === 'quan' || district.name.startsWith('Quận') || 
        district.path_with_type?.includes('Quận')) {
        prefix = 'Quận';
    } else if (district.type === 'thanh-pho' || district.name.startsWith('Thành phố') || 
               district.path_with_type?.includes('Thành phố')) {
        prefix = 'Thành phố';
    } else if (district.type === 'thi-xa' || district.name.startsWith('Thị xã') || 
               district.path_with_type?.includes('Thị xã')) {
        prefix = 'Thị xã';
    }
    
    // Nếu tên đã có prefix, không thêm nữa
    if (district.name.startsWith('Quận') || 
        district.name.startsWith('Huyện') || 
        district.name.startsWith('Thành phố') || 
        district.name.startsWith('Thị xã')) {
        return {
            ...district,
            displayName: district.name
        };
    }
    
    return {
        ...district,
        displayName: `${prefix} ${district.name}`
    };
};

// Hàm thêm tiền tố cho phường/xã
const formatWardName = (ward) => {
    if (!ward) return '';
    
    // Xác định tiền tố dựa vào type hoặc name (nếu có trong data)
    let prefix = 'Xã';
    
    if (ward.type === 'phuong' || ward.name.startsWith('Phường') || 
        ward.path_with_type?.includes('Phường')) {
        prefix = 'Phường';
    } else if (ward.type === 'thi-tran' || ward.name.startsWith('Thị trấn') || 
              ward.path_with_type?.includes('Thị trấn')) {
        prefix = 'Thị trấn';
    }
    
    // Nếu tên đã có prefix, không thêm nữa
    if (ward.name.startsWith('Phường') || 
        ward.name.startsWith('Xã') || 
        ward.name.startsWith('Thị trấn')) {
        return {
            ...ward,
            displayName: ward.name
        };
    }
    
    return {
        ...ward,
        displayName: `${prefix} ${ward.name}`
    };
};

// Lấy danh sách tỉnh/thành phố
export const getProvinces = async () => {
    try {
        // Kiểm tra cache trước
        if (addressCache.provinces) {
            console.log('Trả về danh sách tỉnh/thành phố từ cache');
            return addressCache.provinces;
        }

        console.log('Đang gọi API lấy danh sách tỉnh/thành phố...');
        const response = await axios.get(`${ADDRESS_API_URL}/provinces/getAll?limit=-1`);
        
        if (response.data && response.data.data && response.data.data.data) {
            // Thêm tiền tố và sắp xếp theo alphabet
            const formattedProvinces = response.data.data.data
                .map(formatProvinceName)
                .sort((a, b) => a.displayName.localeCompare(b.displayName, 'vi'));
            
            // Lưu vào cache
            addressCache.provinces = formattedProvinces;
            console.log('Đã lưu danh sách tỉnh/thành phố vào cache:', formattedProvinces.length);
            return formattedProvinces;
        }
        
        throw new Error('Không nhận được dữ liệu tỉnh/thành phố');
    } catch (error) {
        console.error('Error fetching provinces:', error);
        throw error;
    }
};

// Lấy danh sách quận/huyện theo tỉnh/thành phố
export const getDistricts = async (provinceCode) => {
    try {
        // Kiểm tra cache trước
        if (addressCache.districts[provinceCode]) {
            console.log(`Trả về danh sách quận/huyện của tỉnh ${provinceCode} từ cache`);
            return addressCache.districts[provinceCode];
        }

        console.log(`Đang gọi API lấy danh sách quận/huyện của tỉnh ${provinceCode}...`);
        const response = await axios.get(`${ADDRESS_API_URL}/districts/getByProvince?provinceCode=${provinceCode}&limit=-1`);
        
        if (response.data && response.data.data && response.data.data.data) {
            // Thêm tiền tố và sắp xếp theo alphabet
            const formattedDistricts = response.data.data.data
                .map(formatDistrictName)
                .sort((a, b) => a.displayName.localeCompare(b.displayName, 'vi'));
            
            // Lưu vào cache
            addressCache.districts[provinceCode] = formattedDistricts;
            console.log(`Đã lưu danh sách quận/huyện của tỉnh ${provinceCode} vào cache:`, formattedDistricts.length);
            return formattedDistricts;
        }
        
        throw new Error('Không nhận được dữ liệu quận/huyện');
    } catch (error) {
        console.error(`Error fetching districts for province ${provinceCode}:`, error);
        throw error;
    }
};

// Lấy danh sách phường/xã theo quận/huyện
export const getWards = async (districtCode) => {
    try {
        // Kiểm tra cache trước
        if (addressCache.wards[districtCode]) {
            console.log(`Trả về danh sách phường/xã của quận/huyện ${districtCode} từ cache`);
            return addressCache.wards[districtCode];
        }

        console.log(`Đang gọi API lấy danh sách phường/xã của quận/huyện ${districtCode}...`);
        const response = await axios.get(`${ADDRESS_API_URL}/wards/getByDistrict?districtCode=${districtCode}&limit=-1`);
        
        if (response.data && response.data.data && response.data.data.data) {
            // Thêm tiền tố và sắp xếp theo alphabet
            const formattedWards = response.data.data.data
                .map(formatWardName)
                .sort((a, b) => a.displayName.localeCompare(b.displayName, 'vi'));
            
            // Lưu vào cache
            addressCache.wards[districtCode] = formattedWards;
            console.log(`Đã lưu danh sách phường/xã của quận/huyện ${districtCode} vào cache:`, formattedWards.length);
            return formattedWards;
        }
        
        throw new Error('Không nhận được dữ liệu phường/xã');
    } catch (error) {
        console.error(`Error fetching wards for district ${districtCode}:`, error);
        throw error;
    }
};

// API lấy địa chỉ người dùng
export const getUserAddresses = async () => {
    try {
        console.log('Đang gọi API lấy địa chỉ người dùng...');
        const token = tokenService.getToken();
        if (!token) {
            throw new Error('Chưa đăng nhập. Vui lòng đăng nhập để xem địa chỉ.');
        }
        
        const response = await axiosInstance.get(`${API_URL}/address/list`);
        
        console.log('Địa chỉ người dùng:', response.data);
        return response.data.data || [];
    } catch (error) {
        console.error('Error fetching user addresses:', error);
        throw error.response?.data?.message || "Không thể lấy thông tin địa chỉ";
    }
};

// API cập nhật địa chỉ người dùng
export const updateUserAddress = async (addresses) => {
    try {
        console.log('Sending address update request:', addresses);
        const token = tokenService.getToken();
        if (!token) {
            throw new Error('Chưa đăng nhập. Vui lòng đăng nhập để cập nhật địa chỉ.');
        }
        
        const response = await axiosInstance.put(`${API_URL}/address/upd`, addresses);
        
        console.log('Kết quả cập nhật địa chỉ:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error updating user address:', error);
        throw error.response?.data?.message || "Không thể cập nhật địa chỉ";
    }
};

// Lưu địa chỉ mặc định
export const saveDefaultAddress = async (addressData) => {
    try {
        console.log('Sending default address save request:', addressData);
        const token = tokenService.getToken();
        if (!token) {
            throw new Error('Chưa đăng nhập. Vui lòng đăng nhập để lưu địa chỉ.');
        }
        
        const response = await axiosInstance.post(`${API_URL}/address/add`, addressData);
        
        console.log('Kết quả lưu địa chỉ:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error saving default address:', error);
        throw error.response?.data?.message || "Không thể lưu địa chỉ";
    }
};