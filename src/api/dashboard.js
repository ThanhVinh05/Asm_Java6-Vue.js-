import axios from 'axios';
import { tokenService } from '../utils/tokenService';
import { getUserDetail } from './user'; // Import getUserDetail

const API_URL = 'http://localhost:8080/dashboard'; // Assuming a /dashboard base URL

// Create axios instance with auth header
const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 10000, // Longer timeout for potential complex queries
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

// --- Actual API Calls ---

// Fetch general dashboard statistics
export const getDashboardStats = async () => {
    try {
        const response = await axiosInstance.get('/stats');
        // Assuming the API returns { status: 200, message: '...', data: { totalOrders: ..., totalUsers: ..., ... } }
        if (response.data && response.data.status === 200) {
            return response.data; // Return the whole response object
        }
        throw new Error(response.data?.message || 'Could not fetch dashboard stats');
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw error.response?.data?.message || 'Failed to load dashboard statistics.';
    }
};

// Fetch revenue statistics for the chart
export const getRevenueStats = async (period, year, month) => {
    try {
        const params = { period, year };
        if (period === 'month' && month) {
            params.month = month;
        }
        const response = await axiosInstance.get('/revenue-stats', { params });
        // Assuming API returns { status: 200, message: '...', data: { labels: [...], datasets: [...] } }
        if (response.data && response.data.status === 200) {
            return response.data; // Return the whole response object
        }
        throw new Error(response.data?.message || 'Could not fetch revenue statistics');
    } catch (error) {
        console.error('Error fetching revenue stats:', error);
        throw error.response?.data?.message || 'Failed to load revenue statistics.';
    }
};

// Fetch recent orders and enrich with customer names
export const getRecentOrders = async (limit = 30) => { // Fetch more orders for filtering
    try {
        // Using the main order endpoint
        const orderApiInstance = axios.create({ baseURL: 'http://localhost:8080/order' });
        orderApiInstance.interceptors.request.use(
            config => {
                const token = tokenService.getToken();
                if (token) {
                    config.headers['Authorization'] = `Bearer ${token}`;
                }
                return config;
            }, error => Promise.reject(error)
        );

        const response = await orderApiInstance.get('/list', {
            params: {
                page: 1, // Get first page
                size: limit,
                sort: 'createdAt:desc' // Sort by newest first
            }
        });

        if (response.data && response.data.status === 200 && response.data.data?.orders) {
            const orders = response.data.data.orders;

            // Fetch user details for each order to get customer name
            const enrichedOrders = await Promise.all(orders.map(async (order) => {
                let customerName = `User ${order.userId || 'N/A'}`;
                if (order.userId) {
                    try {
                        const userDetails = await getUserDetail(order.userId);
                        if (userDetails) {
                            customerName = userDetails.username;
                        }
                    } catch (userError) {
                        console.error(`Failed to fetch user details for userId ${order.userId}:`, userError);
                    }
                }
                return {
                    id: order.id,
                    customerName: customerName, // Use fetched name
                    createdAt: order.createdAt,
                    status: order.status,
                    total: order.totalAmount
                };
            }));

            return { status: 200, message: "Recent orders fetched", data: enrichedOrders };
        }
        throw new Error(response.data?.message || 'Could not fetch recent orders');
    } catch (error) {
        console.error('Error fetching recent orders:', error);
        throw error.response?.data?.message || 'Failed to load recent orders.';
    }
};


// Fetch top selling products
export const getTopProducts = async (limit = 5) => {
    try {
        const response = await axiosInstance.get('/top-products', {
            params: { limit }
        });
        // Assuming API returns { status: 200, message: '...', data: [{ productId: ..., productName: ..., quantity: ..., revenue: ... }] }
        if (response.data && response.data.status === 200) {
            return response.data; // Return the whole response object
        }
        throw new Error(response.data?.message || 'Could not fetch top products');
    } catch (error) {
        console.error('Error fetching top products:', error);
        throw error.response?.data?.message || 'Failed to load top products.';
    }
};

// --- Keep Mock Functions for Reference/Fallback (Optional) ---

// export const getMockDashboardStats = async () => { ... };
// export const getMockRevenueStats = async (period) => { ... };
// export const getMockRecentOrders = async () => { ... };
// export const getMockTopProducts = async () => { ... };
