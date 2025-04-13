export const tokenService = {
    getToken() {
        return localStorage.getItem('accessToken');
    },

    setToken(token) {
        if (!token) return;
        localStorage.setItem('accessToken', token);
        
        // Parse và lưu thông tin user từ token
        const userData = this.parseJwt(token);
        if (userData) {
            this.setUserInfo({
                username: userData.sub,
                userId: userData.userId,
                role: userData.role,
                exp: userData.exp // Lưu thời gian hết hạn của token
            });
        }
    },

    removeToken() {
        // Xóa token
        localStorage.removeItem('accessToken');
        
        // Xóa thông tin user
        localStorage.removeItem('userInfo');
        
        // Xóa dữ liệu checkout
        localStorage.removeItem('checkoutItems');
        localStorage.removeItem('checkoutSubtotal');
        localStorage.removeItem('checkoutShippingFee');
        localStorage.removeItem('checkoutTotal');
        
        // Xóa các dữ liệu khác nếu có
        localStorage.removeItem('cartCount');
        localStorage.removeItem('selectedItems');
        
        // Có thể thêm clear cho các dữ liệu khác tùy theo ứng dụng
        // localStorage.clear(); // Cẩn thận khi dùng clear() vì nó sẽ xóa tất cả
    },

    parseJwt(token) {
        if (!token) return null;
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Error parsing token:', error);
            return null;
        }
    },

    setUserInfo(userInfo) {
        if (!userInfo) return;
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
    },

    getUserInfo() {
        const userInfo = localStorage.getItem('userInfo');
        return userInfo ? JSON.parse(userInfo) : null;
    },

    hasRole(role) {
        const userInfo = this.getUserInfo();
        if (!userInfo?.role) return false;

        const userRole = userInfo.role;
        
        // Kiểm tra nếu role là array của objects
        if (Array.isArray(userRole)) {
            return userRole.some(r => r.authority === role);
        }
        
        // Kiểm tra nếu role là object
        if (typeof userRole === 'object') {
            return userRole.authority === role;
        }
        
        // Kiểm tra nếu role là string
        return userRole === role;
    },

    isTokenExpired() {
        const userInfo = this.getUserInfo();
        if (!userInfo || !userInfo.exp) return true;

        // Convert expiration time to milliseconds
        const expirationTime = userInfo.exp * 1000;
        const currentTime = Date.now();

        // Check if token is expired (with 5 seconds buffer)
        return currentTime >= expirationTime - 5000;
    },

    checkTokenExpiration() {
        if (this.isTokenExpired()) {
            this.removeToken();
            return true;
        }
        return false;
    }
};