<script setup>
import { ref, onMounted } from 'vue';
import { getFeaturedProducts } from '/src/api/product';
import Banner from '/src/components/layout/banner.vue';

const featuredProducts = ref([]);

onMounted(async () => {
    try {
        featuredProducts.value = await getFeaturedProducts();
    } catch (error) {
        console.error('Failed to load featured products:', error);
    }
});

const getFirstImageUrl = (imageJson) => {
    try {
        const images = JSON.parse(imageJson);
        return `/src/assets/img/${images[0]}`; // Tạo đường dẫn đến ảnh đầu tiên
    } catch (error) {
        console.error('Lỗi khi phân tích cú pháp JSON hình ảnh:', error);
        return ''; // Trả về đường dẫn trống nếu có lỗi
    }
};
</script>
<template>
    <div>
        <!-- Khu vực banner -->
        <Banner />
        <!-- Start Categories of The Month -->
        <section class="container py-5">
            <div class="row text-center pt-3">
                <div class="col-lg-6 m-auto">
                    <h1 class="h1">Categories of The Month</h1>
                    <p>
                        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
                        deserunt mollit anim id est laborum.
                    </p>
                </div>
            </div>
            <div class="row">
                <div class="col-12 col-md-4 p-5 mt-3">
                    <a href="#"><img src="/src/assets/img/ACL01_01.png" class="rounded-circle img-fluid border"></a>
                    <h5 class="text-center mt-3 mb-3">Clothes</h5>
                    <p class="text-center"><router-link to="/shop" class="btn btn-success">Go Shop</router-link></p>
                </div>
                <div class="col-12 col-md-4 p-5 mt-3">
                    <a href="#"><img src="/src/assets/img/SHB65X3_04.png" class="rounded-circle img-fluid border"></a>
                    <h2 class="h5 text-center mt-3 mb-3">Shoes</h2>
                    <p class="text-center"><router-link to="/shop" class="btn btn-success">Go Shop</router-link></p>
                </div>
                <div class="col-12 col-md-4 p-5 mt-3">
                    <a href="#"><img src="/src/assets/img/bannerBM_img_02.png"
                            class="rounded-circle img-fluid border"></a>
                    <h2 class="h5 text-center mt-3 mb-3">Backpack</h2>
                    <p class="text-center"><router-link to="/shop" class="btn btn-success">Go Shop</router-link></p>
                </div>
            </div>
        </section>
        <!-- End Categories of The Month -->


        <!-- Start Featured Product -->
        <section class="bg-light">
            <div class="container py-5">
                <div class="row text-center py-3">
                    <div class="col-lg-6 m-auto">
                        <h1 class="h1">Featured Product</h1>
                        <p>
                            Reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                            Excepteur sint occaecat cupidatat non proident.
                        </p>
                    </div>
                </div>
                <div class="row">
                    <div v-for="product in featuredProducts" :key="product.id" class="col-12 col-md-4 mb-4">
                        <div class="card h-100">
                            <a href="shop-single.html">
                                <img :src="getFirstImageUrl(product.image)" class="card-img-top"
                                    :alt="product.productName">
                            </a>
                            <div class="card-body">
                                <ul class="list-unstyled d-flex justify-content-between">
                                    <li>
                                        <i class="text-warning fa fa-star"></i>
                                        <i class="text-warning fa fa-star"></i>
                                        <i class="text-warning fa fa-star"></i>
                                        <i class="text-muted fa fa-star"></i>
                                        <i class="text-muted fa fa-star"></i>
                                    </li>
                                    <li class="text-muted text-right">${{ product.productPrice }}</li>
                                </ul>
                                <router-link :to="{ name: 'productDetail', params: { productId: product.id } }"
                                    class="h2 text-decoration-none text-dark">
                                    {{ product.productName }}
                                </router-link>
                                <p class="card-text">
                                    {{ product.description }}
                                </p>
                                <p class="text-muted">Reviews ({{ product.reviews || 0 }})</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <!-- End Featured Product -->
    </div>
</template>
<style></style>