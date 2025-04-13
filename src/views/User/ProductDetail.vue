<template>
    <div class="product-detail-container">
        <div class="container py-5">
            <section class="product-main bg-light rounded-3 p-4 mb-5">
                <div class="row">
                    <!-- Product Images -->
                    <div class="col-lg-5">
                        <div class="product-gallery">
                            <div class="main-image-container mb-4">
                                <div class="card border-0 shadow-sm">
                                    <img class="card-img img-fluid" :src="mainImage" alt="Product Image"
                                        id="product-detail">
                                </div>
                            </div>
                            <div class="thumbnail-slider" v-if="product.image && JSON.parse(product.image).length > 1">
                                <div class="row g-2">
                                    <div class="col-1 d-flex align-items-center justify-content-center">
                                        <button class="btn btn-link text-dark p-0" @click="prevImage">
                                            <i class="fas fa-chevron-left"></i>
                                        </button>
                                    </div>
                                    <div class="col-10">
                                        <div class="row g-2">
                                            <div class="col-4" v-for="(img, index) in visibleImages" :key="index">
                                                <div class="thumbnail-item" :class="{ active: mainImage.includes(img) }"
                                                    @click="setMainImageOnClick(img)">
                                                    <img class="img-fluid rounded" :src="`/src/assets/img/${img}`"
                                                        :alt="`Product Image ${index + 1}`">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-1 d-flex align-items-center justify-content-center">
                                        <button class="btn btn-link text-dark p-0" @click="nextImage">
                                            <i class="fas fa-chevron-right"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Product Info -->
                    <div class="col-lg-7">
                        <div class="product-info card border-0 shadow-sm">
                            <div class="card-body p-4">
                                <h1 class="product-title h2 mb-3">{{ product.productName }}</h1>
                                <p class="product-price h3 text-success mb-4">${{ product.productPrice }}</p>

                                <div class="product-description mb-4">
                                    <h6 class="text-muted mb-2">Description:</h6>
                                    <p class="mb-0">{{ product.description }}</p>
                                </div>

                                <div class="product-meta row mb-4">
                                    <div class="col-md-6">
                                        <h6 class="text-muted mb-2">Brand:</h6>
                                        <p class="mb-0">Easy Wear</p>
                                    </div>
                                    <div class="col-md-6">
                                        <h6 class="text-muted mb-2">Available Color:</h6>
                                        <p class="mb-0">White / Black</p>
                                    </div>
                                </div>

                                <form @submit.prevent="addToCart" class="product-form">
                                    <div class="row mb-4">
                                        <div class="col-md-6">
                                            <h6 class="text-muted mb-2">Size:</h6>
                                            <div class="size-selector">
                                                <button type="button" class="btn btn-outline-secondary size-btn"
                                                    v-for="size in ['S', 'M', 'L', 'XL']" :key="size"
                                                    @click="selectedSize = size"
                                                    :class="{ 'active': selectedSize === size }">
                                                    {{ size }}
                                                </button>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <h6 class="text-muted mb-2">Quantity:</h6>
                                            <div class="quantity-selector">
                                                <button class="btn btn-outline-secondary" type="button"
                                                    @click="decreaseQuantity">
                                                    <i class="fas fa-minus"></i>
                                                </button>
                                                <input type="number" class="form-control" v-model="quantity" min="1">
                                                <button class="btn btn-outline-secondary" type="button"
                                                    @click="increaseQuantity">
                                                    <i class="fas fa-plus"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="product-actions d-grid gap-2">
                                        <button type="submit" class="btn btn-success btn-lg">
                                            <i class="fas fa-shopping-cart me-2"></i>Add to Cart
                                        </button>
                                        <button type="button" class="btn btn-outline-success btn-lg">
                                            <i class="fas fa-bolt me-2"></i>Buy Now
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Related Products -->
            <section class="related-products">
                <div class="container px-0">
                    <h4 class="section-title mb-4">Related Products</h4>
                    <div v-if="relatedProducts.length > 0">
                        <div class="row g-4">
                            <div class="col-6 col-md-3" v-for="(product, index) in displayedProducts" :key="index">
                                <div class="card h-100 border-0 shadow-sm product-card">
                                    <div class="product-image">
                                        <img class="img-fluid" :src="getFirstImageUrl(product.image)"
                                            :alt="product.productName">
                                        <div class="product-overlay">
                                            <router-link
                                                :to="{ name: 'productDetail', params: { productId: product.id } }"
                                                class="btn btn-light btn-sm">
                                                <i class="fas fa-eye me-2"></i>View Details
                                            </router-link>
                                        </div>
                                    </div>
                                    <div class="card-body">
                                        <h5 class="product-title">{{ product.productName }}</h5>
                                        <p class="product-price mb-0">${{ product.productPrice }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="navigation-buttons d-flex justify-content-center mt-4">
                            <button class="btn btn-outline-secondary mx-2" :disabled="startIndex === 0"
                                @click="prevProducts">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <button class="btn btn-outline-secondary mx-2"
                                :disabled="startIndex + 4 >= relatedProducts.length" @click="nextProducts">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                    <div v-else class="text-center py-5">
                        <div class="spinner-border text-success" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>

<script>
import { getProductDetail, getProducts } from '/src/api/product';
import { addToCart } from '../../api/cart';
import { cartStore } from '../../store/cartStore';
import Swal from 'sweetalert2';

export default {
    data() {
        return {
            product: {},
            relatedProducts: [],
            visibleImages: [],
            allImages: [],
            mainImage: '',
            autoSlideInterval: null,
            startIndex: 0, // Vị trí bắt đầu của sản phẩm hiển thị
            productsPerPage: 4, // Số sản phẩm hiển thị trên mỗi trang
            selectedSize: 'S',
            quantity: 1,
        };
    },
    async mounted() {
        try {
            const productId = this.$route.params.productId;
            this.product = await getProductDetail(productId);
            const relatedData = await getProducts(1, 10, this.product.categoryId);
            this.relatedProducts = relatedData.products.filter(p => p.id !== productId);
            this.allImages = JSON.parse(this.product.image);
            this.visibleImages = this.allImages.slice(0, 3);
            this.mainImage = `/src/assets/img/${this.allImages[0]}`;
            this.startAutoSlide();
        } catch (error) {
            console.error('Failed to fetch product details:', error);
        }
    },
    beforeUnmount() {
        this.stopAutoSlide();
    },
    computed: {
        displayedProducts() {
            return this.relatedProducts.slice(this.startIndex, this.startIndex + this.productsPerPage);
        },
    },
    watch: {
        '$route.params.productId': 'fetchProductDetails',
    },
    methods: {
        async fetchProductDetails() {
            try {
                const productId = this.$route.params.productId;
                this.product = await getProductDetail(productId);
                const relatedData = await getProducts(1, 10, this.product.categoryId);
                this.relatedProducts = relatedData.products.filter(p => p.id !== productId);
                this.allImages = JSON.parse(this.product.image);
                this.visibleImages = this.allImages.slice(0, 3);
                this.mainImage = `/src/assets/img/${this.allImages[0]}`;
            } catch (error) {
                console.error('Failed to fetch product details:', error);
            }
        },
        getFirstImageUrl(imageJson) {
            try {
                const images = JSON.parse(imageJson);
                return `/src/assets/img/${images[0]}`;
            } catch (error) {
                console.error('Lỗi khi phân tích cú pháp JSON hình ảnh:', error);
                return '';
            }
        },
        nextImage() {
            this.allImages.push(this.allImages.shift());
            this.visibleImages = this.allImages.slice(0, 3);
        },
        prevImage() {
            this.allImages.unshift(this.allImages.pop());
            this.visibleImages = this.allImages.slice(0, 3);
        },
        setMainImageOnClick(image) {
            this.mainImage = `/src/assets/img/${image}`;
        },
        startAutoSlide() {
            this.autoSlideInterval = setInterval(() => {
                this.nextImage();
            }, 5000);
        },
        stopAutoSlide() {
            clearInterval(this.autoSlideInterval);
        },
        nextProducts() {
            this.startIndex += this.productsPerPage;
        },
        prevProducts() {
            this.startIndex -= this.productsPerPage;
        },
        async addToCart() {
            try {
                await addToCart(this.product.id, this.quantity);
                await cartStore.updateCartCount();

                Swal.fire({
                    icon: 'success',
                    title: 'Thành công!',
                    text: 'Đã thêm sản phẩm vào giỏ hàng',
                    showConfirmButton: false,
                    timer: 1500
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi',
                    text: 'Không thể thêm vào giỏ hàng. Vui lòng thử lại sau.'
                });
            }
        },
        decreaseQuantity() {
            if (this.quantity > 1) {
                this.quantity--;
            }
        },
        increaseQuantity() {
            this.quantity++;
        },
    },
};
</script>

<style scoped>
.product-detail-container {
    background-color: #f8f9fa;
    min-height: 100vh;
}

.product-main {
    background-color: white !important;
}

.product-gallery {
    position: sticky;
    top: 20px;
}

.main-image-container {
    border-radius: 10px;
    overflow: hidden;
}

.main-image-container img {
    width: 100%;
    height: auto;
    object-fit: cover;
}

.thumbnail-slider {
    position: relative;
}

.thumbnail-item {
    cursor: pointer;
    border-radius: 5px;
    overflow: hidden;
    border: 2px solid transparent;
    transition: all 0.3s ease;
}

.thumbnail-item.active {
    border-color: #198754;
}

.thumbnail-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.product-info {
    border-radius: 10px;
}

.product-title {
    color: #2c3e50;
    font-weight: 600;
}

.product-price {
    color: #198754;
    font-weight: bold;
}

.product-description {
    color: #6c757d;
    line-height: 1.6;
}

.size-selector {
    display: flex;
    gap: 0.5rem;
}

.size-btn {
    min-width: 45px;
    height: 45px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
    transition: all 0.3s ease;
}

.size-btn.active {
    background-color: #198754;
    color: white;
    border-color: #198754;
}

.quantity-selector {
    display: flex;
    align-items: center;
    max-width: 150px;
}

.quantity-selector input {
    text-align: center;
    border-radius: 0;
    border-left: 0;
    border-right: 0;
}

.quantity-selector button {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.product-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    border-radius: 10px;
    overflow: hidden;
}

.product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
}

.product-image {
    position: relative;
    padding-top: 100%;
    overflow: hidden;
}

.product-image img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.product-overlay {
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

.product-card:hover .product-overlay {
    opacity: 1;
}

.product-card:hover .product-image img {
    transform: scale(1.1);
}

.section-title {
    color: #2c3e50;
    font-weight: 600;
}

.navigation-buttons .btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.3s ease;
}

.navigation-buttons .btn:hover:not(:disabled) {
    background-color: #198754;
    color: white;
    border-color: #198754;
}

@media (max-width: 991.98px) {
    .product-gallery {
        position: static;
        margin-bottom: 2rem;
    }
}

@media (max-width: 767.98px) {
    .size-selector {
        justify-content: flex-start;
        flex-wrap: wrap;
    }

    .quantity-selector {
        max-width: 100%;
    }
}
</style>