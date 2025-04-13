import axios from 'axios';
import { tokenService } from '../../utils/tokenService';

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

export default {
  namespaced: true,
  state: {
    orders: [],
    loading: false,
    error: null
  },
  mutations: {
    SET_ORDERS(state, orders) {
      state.orders = orders;
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    UPDATE_ORDER_STATUS(state, { orderId, status }) {
      const order = state.orders.find(o => o.id === orderId);
      if (order) {
        order.status = status;
      }
    }
  },
  actions: {
    async fetchAllOrders({ commit }) {
      commit('SET_LOADING', true);
      try {
        // Get all orders from admin API
        const response = await axiosInstance.get('/admin/list');
        console.log('Orders API response:', response);
        
        let ordersData = [];
        if (response.data && response.data.status === 200) {
          if (response.data.data && Array.isArray(response.data.data)) {
            ordersData = response.data.data;
          } else if (response.data.data && response.data.data.content) {
            ordersData = response.data.data.content;
          }
        }
        
        // Sort orders by updatedAt (newest first)
        ordersData.sort((a, b) => {
          const dateA = new Date(a.updatedAt || a.createdAt);
          const dateB = new Date(b.updatedAt || b.createdAt);
          return dateB - dateA;
        });
        
        commit('SET_ORDERS', ordersData);
        return { data: ordersData };
      } catch (error) {
        console.error('Error fetching orders:', error);
        commit('SET_ERROR', error.message);
        
        // Return mock data for development if API fails
        const mockOrders = getMockOrders();
        commit('SET_ORDERS', mockOrders);
        return { data: mockOrders };
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async updateOrderStatus({ commit }, { orderId, status }) {
      try {
        console.log(`Updating order ${orderId} status to ${status}`);
        const response = await axiosInstance.put(`/${orderId}/status`, { status });
        
        if (response.data && response.data.status === 200) {
          commit('UPDATE_ORDER_STATUS', { orderId, status });
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error updating order status:', error);
        commit('SET_ERROR', error.message);
        throw error;
      }
    },
    async getOrderDetails({ commit }, orderId) {
      try {
        const response = await axiosInstance.get(`/${orderId}`);
        if (response.data && response.data.status === 200) {
          return response.data.data;
        }
        throw new Error('Invalid response format');
      } catch (error) {
        console.error('Error fetching order details:', error);
        commit('SET_ERROR', error.message);
        throw error;
      }
    }
  },
  getters: {
    allOrders: state => state.orders,
    isLoading: state => state.loading,
    error: state => state.error,
    orderById: state => id => state.orders.find(order => order.id === id)
  }
};

// Mock data for development
function getMockOrders() {
  return [
    {
      id: 1,
      userId: 1,
      status: 'PENDING',
      totalAmount: 150000,
      paymentMethod: 'COD',
      note: 'Giao hàng nhanh',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      userId: 2,
      status: 'CONFIRMED',
      totalAmount: 250000,
      paymentMethod: 'BANK',
      note: 'Gọi trước khi giao',
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 47 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 3,
      userId: 1,
      status: 'SHIPPING',
      totalAmount: 350000,
      paymentMethod: 'MOMO',
      note: '',
      createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 70 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 4,
      userId: 3,
      status: 'COMPLETED',
      totalAmount: 180000,
      paymentMethod: 'COD',
      note: '',
      createdAt: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 90 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 5,
      userId: 2,
      status: 'CANCELLED',
      totalAmount: 120000,
      paymentMethod: 'COD',
      note: 'Đổi ý không mua nữa',
      createdAt: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 118 * 60 * 60 * 1000).toISOString()
    }
  ];
} 