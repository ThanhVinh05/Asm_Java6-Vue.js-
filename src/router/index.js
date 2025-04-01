import { createRouter, createWebHistory } from 'vue-router';

import Home from '../views/home.vue';
import About from '../views/about.vue';
import Shop from '../views/shop.vue';
import ProductDetail from '../views/productDetail.vue';

const routes = [
  { path: "/", name: "home", component: Home },
  { path: "/about", name: "about", component: About },
  { path: "/shop", name: "shop", component: Shop },
  { path: '/product/:productId', name: 'productDetail', component: ProductDetail }, // Giữ lại route này
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;