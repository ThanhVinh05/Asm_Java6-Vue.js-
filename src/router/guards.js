import { tokenService } from '../utils/tokenService';
import { userStore } from '../store/userStore';
import { cartStore } from '../store/cartStore';

export const authGuard = (to, from, next) => {
    const isAuthenticated = tokenService.getToken();
    const userInfo = tokenService.getUserInfo();

    // Check if token is expired
    if (isAuthenticated && tokenService.checkTokenExpiration()) {
        userStore.clearUserInfo();
        cartStore.resetCart();
        next('/login');
        return;
    }

    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (!isAuthenticated) {
            next('/login');
            return;
        }

        // Kiểm tra role nếu route yêu cầu
        if (to.matched.some(record => record.meta.requiresAdmin)) {
            // Kiểm tra xem user có role ADMIN không
            const hasAdminRole = userInfo?.role?.some(role => 
                typeof role === 'string' 
                    ? role === 'ROLE_ADMIN'
                    : role.authority === 'ROLE_ADMIN'
            );

            if (!hasAdminRole) {
                next('/forbidden');
                return;
            }
        }
    }

    next();
};
