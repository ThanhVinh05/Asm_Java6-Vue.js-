import { useStore } from 'vuex';
import { jwtDecode } from 'jwt-decode';
import { tokenService } from '../utils/tokenService';

export const authGuard = async (to, from, next) => {
  const store = useStore();
  const token = tokenService.getToken();

  // Kiểm tra token
  if (!token) {
    if (to.meta.requiresAuth) {
      // Nếu route yêu cầu đăng nhập và không có token, chuyển hướng đến trang login
      next({ name: 'login', query: { redirect: to.fullPath } });
    } else {
      // Nếu route không yêu cầu đăng nhập, cho phép truy cập
      next();
    }
    return;
  }

  try {
    // Giải mã token
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    // Kiểm tra token hết hạn
    if (decoded.exp < currentTime) {
      tokenService.removeToken();
      store.dispatch('auth/logout');
      next({ name: 'login', query: { redirect: to.fullPath } });
      return;
    }

    // Cập nhật state với thông tin user
    await store.dispatch('auth/setUser', decoded);

    // Kiểm tra quyền admin cho các route yêu cầu admin
    if (to.meta.requiresAdmin) {
      const userRole = decoded.role;
      let isAdmin = false;

      if (Array.isArray(userRole)) {
        isAdmin = userRole.some(r => r.authority === 'ADMIN');
      } else if (typeof userRole === 'object') {
        isAdmin = userRole.authority === 'ADMIN';
      } else {
        isAdmin = userRole === 'ADMIN';
      }

      if (!isAdmin) {
        next({ name: 'forbidden' });
        return;
      }
    }

    // Cho phép truy cập
    next();
  } catch (error) {
    console.error('Token validation error:', error);
    tokenService.removeToken();
    store.dispatch('auth/logout');
    next({ name: 'login', query: { redirect: to.fullPath } });
  }
};
