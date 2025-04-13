import axios from 'axios';
import { tokenService } from '../../utils/tokenService';

// API endpoint
const API_URL = 'http://localhost:8080/category';

export default {
  namespaced: true,
  state: {
    categories: [],
    loading: false,
    error: null
  },
  mutations: {
    SET_CATEGORIES(state, categories) {
      state.categories = categories;
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    ADD_CATEGORY(state, category) {
      state.categories.push(category);
    },
    DELETE_CATEGORY(state, categoryId) {
      state.categories = state.categories.filter(c => c.id !== categoryId);
    }
  },
  actions: {
    async fetchAllCategories({ commit }) {
      commit('SET_LOADING', true);
      try {
        const response = await axios.get(`${API_URL}/list`, {
          headers: {
            'Authorization': `Bearer ${tokenService.getToken()}`
          }
        });
        
        console.log('Categories response:', response);
        
        // Handle nested response structure
        let categoriesData = [];
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          categoriesData = response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
          categoriesData = response.data;
        } else if (response.data && response.data.data) {
          categoriesData = response.data.data;
        }
        
        commit('SET_CATEGORIES', categoriesData);
        return { data: categoriesData };
      } catch (error) {
        console.error('Error fetching categories:', error);
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async createCategory({ commit }, categoryData) {
      try {
        const response = await axios.post('/api/categories', categoryData);
        commit('ADD_CATEGORY', response.data);
        return response;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      }
    },
    async deleteCategory({ commit }, categoryId) {
      try {
        await axios.delete(`/api/categories/${categoryId}`);
        commit('DELETE_CATEGORY', categoryId);
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      }
    }
  },
  getters: {
    allCategories: state => state.categories,
    isLoading: state => state.loading,
    error: state => state.error,
    categoryById: state => id => state.categories.find(category => category.id === id)
  }
}; 