import { getUsers, getUserDetail, updateUser, updateUserRole, updateUserStatus, deleteUser } from '../../api/user';
import { tokenService } from '../../utils/tokenService';

export default {
  namespaced: true,
  state: {
    users: [],
    userDetail: null,
    currentPage: 1,
    totalPages: 0,
    totalElements: 0,
    loading: false,
    error: null
  },
  mutations: {
    SET_USERS(state, { users, totalPages, totalElements, currentPage }) {
      state.users = users;
      state.totalPages = totalPages;
      state.totalElements = totalElements;
      state.currentPage = currentPage;
    },
    SET_USER_DETAIL(state, userDetail) {
      state.userDetail = userDetail;
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    UPDATE_USER(state, updatedUser) {
      const index = state.users.findIndex(u => u.id === updatedUser.id);
      if (index !== -1) {
        state.users.splice(index, 1, updatedUser);
      }
    },
    UPDATE_USER_ROLE(state, { userId, role }) {
      const user = state.users.find(u => u.id === userId);
      if (user) {
        user.role = role;
      }
    },
    UPDATE_USER_STATUS(state, { userId, status }) {
      const user = state.users.find(u => u.id === userId);
      if (user) {
        user.status = status;
      }
    },
    DELETE_USER(state, userId) {
      state.users = state.users.filter(u => u.id !== userId);
    }
  },
  actions: {
    async fetchAllUsers({ commit }, { page = 1, size = 10, keyword, sort } = {}) {
      commit('SET_LOADING', true);
      try {
        console.log('Fetching users with params:', { page, size, keyword, sort });
        const token = tokenService.getToken();
        console.log('Using token:', token ? 'Valid token' : 'No token');
        
        if (token) {
          console.log('Token first 10 chars:', token.substring(0, 10) + '...');
          try {
            const decoded = tokenService.parseJwt(token);
            console.log('Token payload:', decoded);
          } catch (e) {
            console.error('Error decoding token:', e);
          }
        }
        
        try {
          console.log('Debug: Direct API call to /user/list');
          const url = `http://localhost:8080/user/list?page=${page}&size=${size}`;
          console.log('Direct URL:', url);

          const headers = {};
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
          console.log('Headers:', headers);

          const directResponse = await fetch(url, {
            method: 'GET',
            headers: headers
          });
          
          console.log('Direct fetch status:', directResponse.status, directResponse.statusText);
          const directData = await directResponse.text();
          console.log('Direct response text:', directData);
          
          try {
            const jsonData = JSON.parse(directData);
            console.log('Parsed response:', jsonData);
          } catch (jsonError) {
            console.error('Cannot parse response as JSON:', jsonError);
          }
        } catch (directError) {
          console.error('Direct API call error:', directError);
        }

        console.log('Starting official API call with getUsers');
        const response = await getUsers(page, size, keyword, sort);
        console.log('Users response:', response);
        
        if (response) {
          commit('SET_USERS', {
            users: response.users || [],
            totalPages: response.totalPages || 0,
            totalElements: response.totalElements || 0,
            currentPage: page
          });
          return { 
            data: response.users || [],
            totalPages: response.totalPages || 0,
            totalElements: response.totalElements || 0
          };
        }
        
        return { data: [], totalPages: 0, totalElements: 0 };
      } catch (error) {
        console.error('Error in fetchAllUsers:', error);
        console.error('Error response:', error.response?.data || 'No response data');
        console.error('Error stack:', error.stack);
        commit('SET_ERROR', error.message || 'Failed to fetch users');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async fetchUserById({ commit }, userId) {
      commit('SET_LOADING', true);
      try {
        const userDetail = await getUserDetail(userId);
        commit('SET_USER_DETAIL', userDetail);
        return userDetail;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async updateUser({ commit }, userData) {
      try {
        const result = await updateUser(userData);
        if (result) {
          commit('UPDATE_USER', userData);
        }
        return result;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      }
    },
    
    async updateUserRole({ commit }, { userId, role }) {
      try {
        const result = await updateUserRole(userId, role);
        if (result) {
          commit('UPDATE_USER_ROLE', { userId, role });
        }
        return result;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      }
    },
    
    async updateUserStatus({ commit }, { userId, status }) {
      try {
        const result = await updateUserStatus(userId, status);
        if (result) {
          commit('UPDATE_USER_STATUS', { userId, status });
        }
        return result;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      }
    },
    
    async deleteUser({ commit }, userId) {
      try {
        const result = await deleteUser(userId);
        if (result) {
          commit('DELETE_USER', userId);
        }
        return result;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      }
    }
  },
  getters: {
    allUsers: state => state.users,
    userDetail: state => state.userDetail,
    isLoading: state => state.loading,
    error: state => state.error,
    totalPages: state => state.totalPages,
    totalElements: state => state.totalElements,
    currentPage: state => state.currentPage,
    userById: state => id => state.users.find(user => user.id === id)
  }
}; 