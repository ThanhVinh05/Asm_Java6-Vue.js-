import axios from 'axios';
import { API_URL } from './config';
import { tokenService } from '../utils/tokenService';

// Create axios instance with auth header
const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 10000
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

// Lấy thống kê tổng quan cho dashboard
export const getDashboardStats = async () => {
    try {
        const response = await axiosInstance.get(`${API_URL}/admin/dashboard/stats`);
        return response.data;
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw error;
    }
};

// Lấy doanh thu theo thời gian (năm/tháng)
export const getRevenueStats = async (period = 'year', year = new Date().getFullYear(), month = null) => {
    let url = `${API_URL}/admin/dashboard/revenue?period=${period}&year=${year}`;
    if (month) url += `&month=${month}`;
    
    try {
        const response = await axiosInstance.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching revenue stats:', error);
        throw error;
    }
};

// Lấy danh sách đơn hàng gần đây
export const getRecentOrders = async (limit = 10) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/admin/dashboard/recent-orders?limit=${limit}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching recent orders:', error);
        throw error;
    }
};

// Lấy top sản phẩm bán chạy
export const getTopProducts = async (limit = 10) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/admin/dashboard/top-products?limit=${limit}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching top products:', error);
        throw error;
    }
};

// API giả để phát triển frontend
export const getMockDashboardStats = async () => {
    return {
        status: 200,
        message: "Dashboard stats retrieved successfully",
        data: {
            totalOrders: 150,
            totalUsers: 100,
            totalProducts: 50,
            totalRevenue: 10000,
            totalCompletedOrders: 120
        }
    };
};

export const getMockRevenueStats = async (period = 'year') => {
    if (period === 'year') {
        return {
            status: 200,
            message: "Revenue stats retrieved successfully",
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [
                    {
                        label: 'Doanh thu (VNĐ)',
                        data: [1200000, 1900000, 3000000, 5000000, 2000000, 3000000, 7000000, 8000000, 4000000, 2000000, 9000000, 10000000]
                    }
                ]
            }
        };
    } else {
        return {
            status: 200,
            message: "Revenue stats retrieved successfully",
            data: {
                labels: ['01', '05', '10', '15', '20', '25', '30'],
                datasets: [
                    {
                        label: 'Doanh thu (VNĐ)',
                        data: [300000, 500000, 700000, 1100000, 900000, 1200000, 1500000]
                    }
                ]
            }
        };
    }
};

export const getMockRecentOrders = async () => {
    return {
        status: 200,
        message: "Recent orders retrieved successfully",
        data: [
            {
                id: 1,
                customerName: "John Doe",
                createdAt: "2024-07-01T08:30:00",
                status: "COMPLETED",
                total: 150000
            },
            {
                id: 2,
                customerName: "Jane Smith",
                createdAt: "2024-07-01T10:15:00",
                status: "SHIPPING",
                total: 250000
            },
            {
                id: 3,
                customerName: "Mike Johnson",
                createdAt: "2024-06-30T14:20:00",
                status: "COMPLETED",
                total: 350000
            },
            {
                id: 4,
                customerName: "Sarah Williams",
                createdAt: "2024-06-30T11:45:00",
                status: "PENDING",
                total: 120000
            },
            {
                id: 5,
                customerName: "Robert Brown",
                createdAt: "2024-06-29T16:30:00",
                status: "CONFIRMED",
                total: 180000
            }
        ]
    };
};

export const getMockTopProducts = async () => {
    return {
        status: 200,
        message: "Top products retrieved successfully",
        data: [
            {
                id: 1,
                productName: "Vợt cầu lông Yonex Astrox 99 Pro",
                quantity: 14,
                revenue: 1400000
            },
            {
                id: 2,
                productName: "Vợt cầu lông Yonex Astrox 100ZZ",
                quantity: 12,
                revenue: 1200000
            },
            {
                id: 3,
                productName: "Vợt cầu lông Victor Auraspeed 90S",
                quantity: 10,
                revenue: 1000000
            },
            {
                id: 4,
                productName: "Giày cầu lông Lining AYAT001-1",
                quantity: 8,
                revenue: 800000
            },
            {
                id: 5,
                productName: "Áo cầu lông Yonex 1560EX",
                quantity: 6,
                revenue: 600000
            },
            {
                id: 6,
                productName: "Áo cầu lông Lining 6088",
                quantity: 5,
                revenue: 500000
            }
        ]
    };
}; 