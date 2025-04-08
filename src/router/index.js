import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/home.vue';
import About from '../views/about.vue';
import Shop from '../views/shop.vue';
import ProductDetail from '../views/productDetail.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import Profile from '../views/Profile.vue';
import Cart from '../views/Cart.vue';
import Checkout from '../views/Checkout.vue';
import Orders from '../views/Orders.vue';
import ForbiddenPage from '../views/ForbiddenPage.vue';
// import AdminLayout from '../views/AdminLayout.vue';
// import AdminDashboard from '../views/AdminDashboard.vue';
// import AdminUsers from '../views/AdminUsers.vue';
// import AdminProducts from '../views/AdminProducts.vue';
import { authGuard } from './guards';

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/about', name: 'about', component: About },
  { path: '/shop', name: 'shop', component: Shop },
  { path: '/product/:productId', name: 'productDetail', component: ProductDetail },
  { path: '/login', name: 'login', component: Login },
  { path: '/register', name: 'register', component: Register },
  { path: '/cart', name: 'cart', component: Cart },

  { path: '/profile', name: 'profile', component: Profile, meta: { requiresAuth: true } },
  { path: '/orders', name: 'orders', component: Orders, meta: { requiresAuth: true } },
  { path: '/checkout', name: 'checkout', component: Checkout, meta: { requiresAuth: true } },
  // Admin routes
  // {
  //   path: '/admin',
  //   name: 'admin',
  //   component: AdminLayout,
  //   meta: { requiresAuth: true, requiresAdmin: true },
  //   children: [
  //     // {
  //     //   path: 'dashboard',
  //     //   name: 'admin-dashboard',
  //     //   component: AdminDashboard
  //     // },
  //     // {
  //     //   path: 'users',
  //     //   name: 'admin-users',
  //     //   component: AdminUsers
  //     // },
  //     // {
  //     //   path: 'products',
  //     //   name: 'admin-products',
  //     //   component: AdminProducts
  //     // }
  //   ]
  // },
  {
    path: '/forbidden',
    name: 'forbidden',
    component: ForbiddenPage
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(authGuard);

export default router;