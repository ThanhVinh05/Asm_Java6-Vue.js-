<script setup>
import { ref, onMounted } from 'vue';
import { getFeaturedProducts } from '/src/api/product';
import Banner from '/src/components/layout/User/banner.vue';
import { addToCart as apiAddToCart } from '../../api/cart';
import { cartStore } from '../../store/cartStore';
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';
import { userStore } from '../../store/userStore';

const featuredProducts = ref([]);
const router = useRouter();

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
        return images && images.length > 0 ? `/src/assets/img/${images[0]}` : null;
    } catch (error) {
        console.error('Error parsing image JSON:', error);
        return null;
    }
};

const handleAddToCart = async (product) => {
    if (!userStore.isLoggedIn.value) {
        const result = await Swal.fire({
            icon: 'warning',
            title: 'Vui lòng đăng nhập',
            text: 'Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng',
            showCancelButton: true,
            confirmButtonText: 'Đăng nhập ngay',
            cancelButtonText: 'Để sau'
        });

        if (result.isConfirmed) {
            router.push('/login');
        }
        return;
    }

    try {
        await apiAddToCart(product.id, 1);
        await cartStore.updateCartCount();

        Swal.fire({
            icon: 'success',
            title: 'Thành công!',
            text: 'Đã thêm sản phẩm vào giỏ hàng',
            showConfirmButton: false,
            timer: 1500
        });
    } catch (error) {
        console.error('Error adding to cart:', error);
        Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: error.message || 'Không thể thêm vào giỏ hàng. Vui lòng thử lại sau.'
        });
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
                <div class="row text-center mb-5">
                    <div class="col-lg-6 mx-auto">
                        <h1 class="display-5 fw-bold mb-3">Featured Products</h1>
                        <p class="lead text-muted">Discover our premium selection of badminton equipment</p>
                    </div>
                </div>
                <div class="row g-4">
                    <div v-for="product in featuredProducts" :key="product.id" class="col-md-6 col-lg-3">
                        <div class="card h-100 border-0 shadow-sm product-card">
                            <div class="card-img-container">
                                <img v-if="getFirstImageUrl(product.image)" :src="getFirstImageUrl(product.image)"
                                    class="card-img-top" :alt="product.productName">
                                <div class="card-overlay">
                                    <router-link :to="{ name: 'productDetail', params: { productId: product.id } }"
                                        class="btn btn-light btn-sm">
                                        <i class="fas fa-eye me-2"></i>View Details
                                    </router-link>
                                </div>
                            </div>
                            <div class="card-body text-center">
                                <h5 class="card-title mb-2">{{ product.productName }}</h5>
                                <p class="card-text text-success fw-bold mb-3">${{ product.productPrice }}</p>
                                <button class="btn btn-outline-success w-100" @click="handleAddToCart(product)">
                                    <i class="fas fa-shopping-cart me-2"></i>Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row mt-5">
                    <div class="col-12 text-center">
                        <router-link to="/shop" class="btn btn-success btn-lg px-5">
                            <i class="fas fa-store me-2"></i>View All Products
                        </router-link>
                    </div>
                </div>
            </div>
        </section>
        <!-- End Featured Product -->
    </div>
</template>
<style scoped>
.product-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    border-radius: 10px;
    overflow: hidden;
}

.product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
}

.card-img-container {
    position: relative;
    overflow: hidden;
    padding-top: 100%;
}

.card-img-top {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.card-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.product-card:hover .card-overlay {
    opacity: 1;
}

.product-card:hover .card-img-top {
    transform: scale(1.1);
}

.btn-outline-success {
    transition: all 0.3s ease;
}

.btn-outline-success:hover {
    transform: translateY(-2px);
}

@media (max-width: 768px) {
    .product-card {
        margin-bottom: 1rem;
    }
}
</style>