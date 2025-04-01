import axios from 'axios';

const API_URL = 'http://localhost:8080/category'; // Thêm API_URL

export async function getCategories() {
    return axios.get(`${API_URL}/list`); // Sử dụng API_URL
}