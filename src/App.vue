<script setup>
import { RouterLink, RouterView } from 'vue-router';
import { useStore } from 'vuex';
import { onMounted } from 'vue';
import Nav from './components/layout/User/nav.vue';
import Footer from './components/layout/User/footer.vue';
import { cartStore } from './store/cartStore';

const store = useStore();

// Khởi tạo trạng thái xác thực khi ứng dụng khởi động
onMounted(async () => {
  // Khởi tạo trạng thái xác thực từ token đã lưu
  await store.dispatch('auth/initialize');

  // Khởi tạo giỏ hàng nếu người dùng đã đăng nhập
  if (store.getters['auth/isAuthenticated']) {
    await cartStore.initializeCart();
  }
});
</script>

<template>
  <div>
    <div class="sticky-top">
      <Nav />
    </div>

    <main class="row">
      <RouterView />
    </main>

    <footer class="row">
      <Footer />
    </footer>
  </div>
</template>

<style>
.row {
  margin: 0;
  padding: 0;
  width: 100%;
}
</style>