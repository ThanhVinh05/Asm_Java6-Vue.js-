import { tokenService } from '../../utils/tokenService';

export default {
  namespaced: true,
  state: {
    user: null,
    token: tokenService.getToken() || null,
    isAuthenticated: false
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user;
      state.isAuthenticated = !!user;
    },
    SET_TOKEN(state, token) {
      state.token = token;
      if (token) {
        tokenService.setToken(token);
      } else {
        tokenService.removeToken();
      }
    },
    CLEAR_AUTH(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      tokenService.removeToken();
    }
  },
  actions: {
    setUser({ commit }, userData) {
      commit('SET_USER', {
        id: userData.userId,
        username: userData.sub,
        role: userData.role,
        exp: userData.exp
      });
    },
    setToken({ commit }, token) {
      if (!token) {
        console.error('Attempted to set null or empty token');
        return;
      }
      console.log('Setting token:', token.substring(0, 20) + '...');
      commit('SET_TOKEN', token);
      
      // Verify token was saved
      const savedToken = tokenService.getToken();
      if (!savedToken) {
        console.error('Token was not saved correctly');
      } else {
        console.log('Token saved successfully');
      }
    },
    logout({ commit }) {
      commit('CLEAR_AUTH');
    },
    async initialize({ commit }) {
      const token = tokenService.getToken();
      if (token) {
        const userData = tokenService.parseJwt(token);
        if (userData && userData.exp > Date.now() / 1000) {
          commit('SET_TOKEN', token);
          commit('SET_USER', {
            id: userData.userId,
            username: userData.sub,
            role: userData.role,
            exp: userData.exp
          });
        } else {
          commit('CLEAR_AUTH');
        }
      }
    }
  },
  getters: {
    isAuthenticated: state => state.isAuthenticated,
    isAdmin: state => {
      if (!state.user || !state.user.role) return false;
      const role = state.user.role;
      
      // Kiểm tra nếu role là array của objects
      if (Array.isArray(role)) {
        return role.some(r => r.authority === 'ADMIN');
      }
      
      // Kiểm tra nếu role là object
      if (typeof role === 'object') {
        return role.authority === 'ADMIN';
      }
      
      // Kiểm tra nếu role là string
      return role === 'ADMIN';
    },
    currentUser: state => state.user,
    token: state => state.token
  }
};
