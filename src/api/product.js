import axios from 'axios';

const API_URL = 'http://localhost:8080/product'; // Thay đổi URL nếu cần

//Trang home
export const getFeaturedProducts = async () => {
    try {
        const response = await axios.get(`${API_URL}/list?page=0&size=8`); // Lấy 6 sản phẩm đầu tiên
        return response.data.data.products; // Trả về mảng sản phẩm
    } catch (error) {
        console.error('Error fetching featured products:', error);
        if (error.code === 'ERR_NETWORK') {
            throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.');
        }
        throw error.response?.data?.message || 'Không thể tải sản phẩm. Vui lòng thử lại sau.';
    }
};

// Trang Shop
export const getProducts = async (page = 1, size = 6, categoryId = null, keyword = null) => {
    try {
        let url = `${API_URL}/list?page=${page}&size=${size}`;
        if (categoryId) {
            url += `&categoryId=${categoryId}`;
        }
        if (keyword) {
            url += `&keyword=${keyword}`; // Thêm tham số keyword
        }
        const response = await axios.get(url);
        return response.data.data; // Trả về toàn bộ dữ liệu phân trang
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
};

// Trang Product Detail
export const getProductDetail = async (productId) => {
    try {
        const response = await axios.get(`${API_URL}/${productId}`);
        return response.data.data; // Trả về chi tiết sản phẩm
    } catch (error) {
        console.error(`Error fetching product detail for ID ${productId}:`, error);
        throw error;
    }
};