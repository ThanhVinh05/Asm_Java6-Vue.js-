<template>
    <div class="container pb-5">
        <section class="bg-light">
            <div class="container pb-5">
                <div class="row">
                    <div class="col-lg-5 mt-5">
                        <div class="card mb-3">
                            <img class="card-img img-fluid" :src="mainImage" alt="Product Image" id="product-detail">
                        </div>
                        <div class="row" v-if="product.image && JSON.parse(product.image).length > 1">
                            <div class="col-1 align-self-center">
                                <a href="#product-images-carousel" role="button" data-bs-slide="prev"
                                    @click="prevImage">
                                    <i class="text-dark fas fa-chevron-left"></i>
                                    <span class="sr-only">Previous</span>
                                </a>
                            </div>
                            <div class="col-10 carousel slide carousel-multi-item" id="product-images-carousel"
                                data-bs-ride="carousel">
                                <div class="carousel-inner product-links-wap" role="listbox">
                                    <div class="carousel-item active">
                                        <div class="row">
                                            <div class="col-4" v-for="(img, index) in visibleImages" :key="index">
                                                <a href="#" @click.prevent="setMainImageOnClick(img)">
                                                    <img class="card-img img-fluid" :src="`/src/assets/img/${img}`"
                                                        :alt="`Product Image ${index + 1}`">
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-1 align-self-center">
                                <a href="#product-images-carousel" role="button" data-bs-slide="next"
                                    @click="nextImage">
                                    <i class="text-dark fas fa-chevron-right"></i>
                                    <span class="sr-only">Next</span>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-7 mt-5">
                        <div class="card">
                            <div class="card-body">
                                <h1 class="h2">{{ product.productName }}</h1>
                                <p class="h3 py-2">${{ product.productPrice }}</p>
                                <p class="py-2"></p>
                                <ul class="list-inline"></ul>
                                <h6>Description:</h6>
                                <p>{{ product.description }}</p>
                                <ul class="list-inline">
                                    <li class="list-inline-item">
                                        <h6>Brand:</h6>
                                    </li>
                                    <li class="list-inline-item">
                                        <p class="text-muted"><strong>Easy Wear</strong></p>
                                    </li>
                                </ul>
                                <ul class="list-inline">
                                    <li class="list-inline-item">
                                        <h6>Avaliable Color :</h6>
                                    </li>
                                    <li class="list-inline-item">
                                        <p class="text-muted"><strong>White / Black</strong></p>
                                    </li>
                                </ul>
                                <h6>Specification:</h6>
                                <ul class="list-unstyled pb-3">
                                    <li>Lorem ipsum dolor sit</li>
                                    <li>Amet, consectetur</li>
                                    <li>Adipiscing elit,set</li>
                                    <li>Duis aute irure</li>
                                    <li>Ut enim ad minim</li>
                                    <li>Dolore magna aliqua</li>
                                    <li>Excepteur sint</li>
                                </ul>
                                <form action="" method="GET">
                                    <input type="hidden" name="product-title" value="Activewear">
                                    <div class="row">
                                        <div class="col-auto">
                                            <ul class="list-inline pb-3">
                                                <li class="list-inline-item">Size :
                                                    <input type="hidden" name="product-size" id="product-size"
                                                        value="S">
                                                </li>
                                                <li class="list-inline-item"><span
                                                        class="btn btn-success btn-size">S</span></li>
                                                <li class="list-inline-item"><span
                                                        class="btn btn-success btn-size">M</span></li>
                                                <li class="list-inline-item"><span
                                                        class="btn btn-success btn-size">L</span></li>
                                                <li class="list-inline-item"><span
                                                        class="btn btn-success btn-size">XL</span></li>
                                            </ul>
                                        </div>
                                        <div class="col-auto">
                                            <ul class="list-inline pb-3">
                                                <li class="list-inline-item text-right">
                                                    Quantity
                                                    <input type="hidden" name="product-quanity" id="product-quanity"
                                                        value="1">
                                                </li>
                                                <li class="list-inline-item"><span class="btn btn-success"
                                                        id="btn-minus">-</span></li>
                                                <li class="list-inline-item"><span class="badge bg-secondary"
                                                        id="var-value">1</span></li>
                                                <li class="list-inline-item"><span class="btn btn-success"
                                                        id="btn-plus">+</span></li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div class="row pb-3">
                                        <div class="col d-grid">
                                            <button type="submit" class="btn btn-success btn-lg" name="submit"
                                                value="buy">Buy</button>
                                        </div>
                                        <div class="col d-grid">
                                            <button type="submit" class="btn btn-success btn-lg" name="submit"
                                                value="addtocard">Add To Cart</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <section class="py-5">
            <div class="container">
                <div class="row text-left p-2 pb-3">
                    <h4>Related Products</h4>
                </div>
                <div v-if="relatedProducts.length > 0">
                    <div class="row">
                        <div class="col-12">
                            <div class="row">
                                <div class="col-3" v-for="(product, index) in displayedProducts" :key="index">
                                    <div class="product-wap card h-100 rounded-0">
                                        <div class="card rounded-0">
                                            <img class="card-img rounded-0 img-fluid"
                                                :src="getFirstImageUrl(product.image)" alt="" />
                                        </div>
                                        <div class="card-body">
                                            <router-link
                                                :to="{ name: 'productDetail', params: { productId: product.id } }"
                                                class="h3 text-decoration-none">
                                                {{ product.productName }}
                                            </router-link>
                                            <p class="text-center mb-0">${{ product.productPrice }}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 d-flex justify-content-center mt-3">
                            <button class="btn btn-outline-secondary mx-1" :disabled="startIndex === 0"
                                @click="prevProducts">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <button class="btn btn-outline-secondary mx-1"
                                :disabled="startIndex + 4 >= relatedProducts.length" @click="nextProducts">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div v-else>Loading related products...</div>
            </div>
        </section>
    </div>
</template>

<script>
import { getProductDetail, getProducts } from '/src/api/product';

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
    },
};
</script>

<style scoped>
.carousel-indicators button {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin: 0 5px;
}
</style>