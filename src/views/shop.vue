<template>
    <div class="shop-container">
        <div class="container py-5">
            <div class="row mb-4">
                <div class="col-12 text-center">
                    <h1 class="display-5 fw-bold mb-3">Our Products</h1>
                    <p class="lead text-muted">Browse our collection of high-quality badminton equipment</p>
                </div>
            </div>
            <div class="row">
                <!-- Sidebar Filter -->
                <div class="col-lg-3">
                    <div class="filter-sidebar">
                        <div class="card border-0 shadow-sm filter-card">
                            <div class="card-body">
                                <h5 class="card-title mb-4">
                                    <i class="fas fa-filter me-2"></i>Filter Products
                                </h5>
                                <div class="mb-4">
                                    <h6 class="mb-3">
                                        <i class="fas fa-tags me-2"></i>Categories
                                    </h6>
                                    <div class="category-list">
                                        <div v-for="category in categories" :key="category.id" class="form-check mb-2">
                                            <input class="form-check-input" type="checkbox"
                                                :id="'category' + category.id"
                                                :checked="selectedCategory === category.id"
                                                @change="selectCategory(category.id)">
                                            <label class="form-check-label" :for="'category' + category.id">
                                                {{ category.categoryName }}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div class="mb-4">
                                    <h6 class="mb-3">
                                        <i class="fas fa-dollar-sign me-2"></i>Price Range
                                    </h6>
                                    <div class="price-range">
                                        <div class="input-group mb-2">
                                            <span class="input-group-text">$</span>
                                            <input type="number" class="form-control" placeholder="Min"
                                                v-model="minPrice">
                                        </div>
                                        <div class="input-group">
                                            <span class="input-group-text">$</span>
                                            <input type="number" class="form-control" placeholder="Max"
                                                v-model="maxPrice">
                                        </div>
                                    </div>
                                </div>
                                <button class="btn btn-success w-100" @click="applyFilters">
                                    <i class="fas fa-check me-2"></i>Apply Filters
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Product Grid -->
                <div class="col-lg-9">
                    <div class="product-controls mb-4">
                        <div class="row align-items-center">
                            <div class="col-md-6">
                                <div class="search-box">
                                    <div class="input-group">
                                        <span class="input-group-text bg-white border-end-0">
                                            <i class="fas fa-search text-muted"></i>
                                        </span>
                                        <input type="text" class="form-control border-start-0"
                                            placeholder="Search products..." v-model="searchKeyword"
                                            @keyup.enter="searchProducts">
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="d-flex justify-content-md-end align-items-center mt-3 mt-md-0">
                                    <div class="view-options me-3">
                                        <div class="btn-group">
                                            <button class="btn btn-outline-success"
                                                :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'">
                                                <i class="fas fa-th-large"></i>
                                            </button>
                                            <button class="btn btn-outline-success"
                                                :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'">
                                                <i class="fas fa-list"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <select class="form-select w-auto" v-model="sortBy" @change="sortProducts">
                                        <option value="featured">Sort by: Featured</option>
                                        <option value="price_low">Price: Low to High</option>
                                        <option value="price_high">Price: High to Low</option>
                                        <option value="newest">Newest First</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="product-grid">
                        <div class="row g-4" :class="{ 'row-cols-1': viewMode === 'list' }">
                            <div v-for="product in products" :key="product.id" :class="[
                                viewMode === 'grid' ? 'col-md-6 col-lg-4' : 'col-12',
                                'product-item'
                            ]">
                                <div class="card h-100 border-0 shadow-sm product-card"
                                    :class="{ 'flex-row': viewMode === 'list' }">
                                    <div class="product-image" :class="{ 'col-md-4': viewMode === 'list' }">
                                        <img v-if="getFirstImageUrl(product.image)"
                                            :src="getFirstImageUrl(product.image)" :alt="product.productName">
                                        <div class="product-overlay">
                                            <button class="btn btn-light btn-sm" @click="quickView(product)">
                                                <i class="fas fa-eye me-2"></i>Quick View
                                            </button>
                                        </div>
                                    </div>
                                    <div class="card-body" :class="{ 'col-md-8': viewMode === 'list' }">
                                        <h5 class="product-title">{{ product.productName }}</h5>
                                        <p class="product-price">${{ product.productPrice }}</p>
                                        <div class="product-actions">
                                            <router-link
                                                :to="{ name: 'productDetail', params: { productId: product.id } }"
                                                class="btn btn-outline-success btn-sm">
                                                <i class="fas fa-info-circle me-2"></i>Details
                                            </router-link>
                                            <button class="btn btn-success btn-sm" @click="addToCart(product)">
                                                <i class="fas fa-shopping-cart"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Pagination -->
                    <nav class="mt-5">
                        <ul class="pagination justify-content-center">
                            <li class="page-item" :class="{ disabled: currentPage === 1 }">
                                <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">
                                    <i class="fas fa-chevron-left"></i>
                                </a>
                            </li>
                            <li v-for="page in totalPages" :key="page" class="page-item"
                                :class="{ active: currentPage === page }">
                                <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
                            </li>
                            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                                <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">
                                    <i class="fas fa-chevron-right"></i>
                                </a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { getProducts } from '/src/api/product';
import { getCategories } from '/src/api/category';
import { addToCart } from '../api/cart';
import { cartStore } from '../store/cartStore';
import Swal from 'sweetalert2';

export default {
    data() {
        return {
            products: [],
            categories: [],
            currentPage: 1,
            totalPages: 1,
            selectedCategory: null,
            searchKeyword: '',
            minPrice: null,
            maxPrice: null,
            sortBy: 'featured',
            viewMode: 'grid'
        };
    },
    mounted() {
        this.searchKeyword = this.$route.query.keyword || '';
        this.loadProducts();
        this.loadCategories();
    },
    watch: {
        '$route.query.keyword': function (newKeyword) {
            this.searchKeyword = newKeyword || '';
            this.currentPage = 1;
            this.loadProducts();
        }
    },
    methods: {
        async loadProducts() {
            try {
                const data = await getProducts(this.currentPage, 6, this.selectedCategory, this.searchKeyword);
                this.products = data.products;
                this.totalPages = data.totalPages;
            } catch (error) {
                console.error('Failed to fetch products:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi',
                    text: 'Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.'
                });
            }
        },
        async changePage(page) {
            if (page >= 1 && page <= this.totalPages) {
                this.currentPage = page;
                await this.loadProducts();
            }
        },
        getFirstImageUrl(imageJson) {
            try {
                const images = JSON.parse(imageJson);
                return images && images.length > 0 ? `/src/assets/img/${images[0]}` : null;
            } catch (error) {
                console.error('Error parsing image JSON:', error);
                return null;
            }
        },
        async loadCategories() {
            try {
                const response = await getCategories();
                this.categories = response.data.data;
            } catch (error) {
                console.error('Failed to fetch categories:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi',
                    text: 'Không thể tải danh mục sản phẩm. Vui lòng thử lại sau.'
                });
            }
        },
        selectCategory(categoryId) {
            this.selectedCategory = this.selectedCategory === categoryId ? null : categoryId;
        },
        applyFilters() {
            this.currentPage = 1;
            this.loadProducts();
        },
        searchProducts() {
            this.currentPage = 1;
            this.loadProducts();
        },
        sortProducts() {
            this.loadProducts();
        },
        async addToCart(product) {
            try {
                await addToCart(product.id, 1);
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
        },
        quickView(product) {
            console.log('Quick view:', product);
        }
    }
};
</script>

<style scoped>
.shop-container {
    background-color: #f8f9fa;
    min-height: 100vh;
}

.filter-sidebar {
    position: sticky;
    top: 20px;
}

.filter-card {
    border-radius: 10px;
}

.search-box {
    max-width: 100%;
}

.search-box .input-group {
    border-radius: 10px;
    overflow: hidden;
}

.product-grid {
    margin-bottom: 2rem;
}

.product-item {
    margin-bottom: 1.5rem;
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

.product-title {
    font-size: 1rem;
    margin-bottom: 0.5rem;
    font-weight: 600;
}

.product-price {
    color: #198754;
    font-weight: bold;
    font-size: 1.1rem;
    margin-bottom: 1rem;
}

.product-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.view-options .btn-group {
    border-radius: 10px;
    overflow: hidden;
}

.view-options .btn {
    padding: 0.5rem 1rem;
}

.pagination {
    margin-bottom: 0;
}

.pagination .page-link {
    border-radius: 5px;
    margin: 0 2px;
    color: #198754;
    transition: all 0.3s ease;
}

.pagination .page-item.active .page-link {
    background-color: #198754;
    border-color: #198754;
    color: white;
}

/* List View Styles */
.product-card.flex-row .product-image {
    padding-top: 0;
    height: 200px;
}

.product-card.flex-row .card-body {
    display: flex;
    flex-direction: column;
    justify-content: center;
}

@media (max-width: 991.98px) {
    .filter-sidebar {
        position: static;
        margin-bottom: 2rem;
    }

    .product-controls {
        margin-top: 1rem;
    }
}

@media (max-width: 767.98px) {
    .product-card.flex-row {
        flex-direction: column !important;
    }

    .product-card.flex-row .product-image {
        width: 100%;
        padding-top: 75%;
    }

    .view-options {
        margin-bottom: 1rem;
    }
}
</style>
