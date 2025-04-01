import { createApp } from 'vue'
import App from './App.vue'
import 'bootstrap/dist/css/bootstrap.css'

// import 'bootstrap-vue/dist/bootstrap-vue.css';
// import 'bootstrap-icons/font/bootstrap-icons.css';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import router from './router';

// Cách 1: Sử dụng trực tiếp
// createApp(App).use(router).mount('#app');

// Cách 2: (Nếu bạn muốn tạo app trước)
const app = createApp(App);
app.use(router);
app.mount('#app');
