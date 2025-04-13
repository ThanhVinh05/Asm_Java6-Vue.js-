import { createStore } from 'vuex';
import auth from './modules/auth';
import products from './modules/products';
import orders from './modules/orders';
import users from './modules/users';
import categories from './modules/categories';

export default createStore({
  modules: {
    auth,
    products,
    orders,
    users,
    categories
  }
}); 