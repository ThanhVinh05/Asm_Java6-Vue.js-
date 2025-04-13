import axios from 'axios';
import { getProducts, getProductDetail, createProduct, updateProduct, deleteProduct } from '../../api/product';

export default {
  namespaced: true,
  state: {
    products: [],
    loading: false,
    error: null
  },
  mutations: {
    SET_PRODUCTS(state, products) {
      state.products = products;
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    ADD_PRODUCT(state, product) {
      state.products.push(product);
    },
    UPDATE_PRODUCT(state, updatedProduct) {
      const index = state.products.findIndex(p => p.id === updatedProduct.id);
      if (index !== -1) {
        state.products.splice(index, 1, updatedProduct);
      }
    },
    DELETE_PRODUCT(state, productId) {
      state.products = state.products.filter(p => p.id !== productId);
    }
  },
  actions: {
    async fetchAllProducts({ commit }) {
      commit('SET_LOADING', true);
      try {
        console.log('Fetching all products from API...');
        const productsData = await getProducts(0, 1000); // Lấy số lượng lớn để đảm bảo lấy tất cả
        
        // Kiểm tra cấu trúc dữ liệu trả về
        let products = [];
        if (productsData && productsData.products) {
          products = productsData.products;
        } else if (Array.isArray(productsData)) {
          products = productsData;
        } else if (productsData && productsData.data) {
          products = productsData.data;
        }
        
        console.log(`Fetched ${products.length} products`);
        commit('SET_PRODUCTS', products || []);
        return { data: products || [] };
      } catch (error) {
        console.error('Error fetching products:', error);
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async fetchProductById({ commit, state }, id) {
      commit('SET_LOADING', true);
      try {
        const existingProduct = state.products.find(p => p.id === parseInt(id) || p.id === id);
        if (existingProduct) {
          return { data: existingProduct };
        }
        
        const productData = await getProductDetail(id);
        return { data: productData };
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async createProduct({ commit }, productData) {
      try {
        const responseData = await createProduct(productData);
        
        // The API now returns a standardized response without the data wrapper
        const productToAdd = responseData;
        
        if (productToAdd) {
          commit('ADD_PRODUCT', productToAdd);
          return { success: true, data: productToAdd };
        } else {
          throw new Error('Invalid response format from server');
        }
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      }
    },
    async updateProduct({ commit }, { id, data }) {
      try {
        const responseData = await updateProduct(id, data);
        
        // Handle standardized response
        if (responseData) {
          commit('UPDATE_PRODUCT', responseData);
          return { success: true, data: responseData };
        } else {
          throw new Error('Invalid response format from server');
        }
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      }
    },
    async deleteProduct({ commit }, productId) {
      try {
        await deleteProduct(productId);
        commit('DELETE_PRODUCT', productId);
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      }
    }
  },
  getters: {
    allProducts: state => state.products,
    isLoading: state => state.loading,
    error: state => state.error,
    productById: state => id => state.products.find(product => product.id === parseInt(id) || product.id === id)
  }
}; 