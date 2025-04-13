import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/User/home.vue';
import About from '../views/User/about.vue';
import Shop from '../views/User/shop.vue';
import ProductDetail from '../views/User/productDetail.vue';
import Login from '../views/User/Login.vue';
import Register from '../views/User/Register.vue';
import Profile from '../views/User/Profile.vue';
import Cart from '../views/User/Cart.vue';
import Checkout from '../views/User/Checkout.vue';
import Orders from '../views/User/Orders.vue';
import ForbiddenPage from '../views/User/ForbiddenPage.vue';
import AdminLayout from '../views/Admin/AdminLayout.vue';
import AdminDashboard from '../views/Admin/Dashboard.vue';
import AdminProducts from '../views/Admin/ManageProducts.vue';
import AdminOrders from '../views/Admin/ManageOrders.vue';
import AdminUsers from '../views/Admin/ManageUsers.vue';
import AdminCategories from '../views/Admin/ManageCategories.vue';
import CreateProduct from '../views/Admin/CreateProduct.vue';
import EditProduct from '../views/Admin/EditProduct.vue';
import OrderDetail from '../views/Admin/OrderDetail.vue';
import { authGuard } from './guards';

const routes = [
  // User routes
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
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        redirect: '/admin/dashboard'
      },
      {
        path: 'dashboard',
        name: 'admin-dashboard',
        component: AdminDashboard
      },
      {
        path: 'products',
        name: 'admin-products',
        component: AdminProducts
      },
      {
        path: 'products/create',
        name: 'admin-product-create',
        component: CreateProduct
      },
      {
        path: 'products/edit/:id',
        name: 'admin-product-edit',
        component: EditProduct
      },
      {
        path: 'orders',
        name: 'admin-orders',
        component: AdminOrders
      },
      {
        path: 'orders/:id',
        name: 'admin-order-detail',
        component: OrderDetail
      },
      {
        path: 'users',
        name: 'admin-users',
        component: AdminUsers
      },
      {
        path: 'categories',
        name: 'admin-categories',
        component: AdminCategories
      }
    ]
  },
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