<script setup>
import { RouterLink, RouterView } from 'vue-router';
import Nav from './components/layout/nav.vue';
import Footer from './components/layout/footer.vue';
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
/* Thêm CSS của bạn ở đây */
/* Ví dụ: */
/* .row { display: flex; flex-wrap: wrap; } */
</style>