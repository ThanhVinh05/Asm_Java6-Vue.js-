<template>
    <div class="container">
        <div class="container p-5">
            <div class="row">
                <div class="col-lg-3">
                    <h1 class="h2 pb-4">Categories</h1>
                    <ul class="list-unstyled templatemo-accordion">
                        <li v-for="category in categories" :key="category.id" class="pb-3">
                            <a class="collapsed d-flex justify-content-between h3 text-decoration-none" href="#"
                                @click.prevent="selectCategory(category.id)">
                                {{ category.categoryName }}
                            </a>
                        </li>
                    </ul>
                </div>
                <div class="col-lg-9">
                    <div class="row">
                        <div class="col-md-9">
                            <a class="h3 text-dark text-decoration-none" href="#">Sắp xếp</a>
                        </div>
                        <div class="col-md-3 pb-4 text-center">
                            <div class="d-flex justify-content-center align-items-center">
                                <select class="form-control" style="text-align: center; text-align-last: center;">
                                    <option>-- Chọn mức giá --</option>
                                    <option> 500.000đ - 1 triệu </option>
                                    <option> 1 triệu - 2 triệu </option>
                                    <option> 2 triệu - 3 triệu </option>
                                    <option> Giá trên 3 triệu </option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div v-for="product in products" :key="product.id" class="col-md-4 mb-4">
                            <div class="card h-100 mb-4 product-wap rounded-0">
                                <div class="card rounded-0">
                                    <img class="card-img rounded-0 img-fluid" :src="getFirstImageUrl(product.image)"
                                        alt="Product Image">
                                    <div
                                        class="card-img-overlay rounded-0 product-overlay d-flex align-items-center justify-content-center">
                                        <ul class="list-unstyled">
                                            <li><a class="btn btn-success text-white" href="#"><i
                                                        class="far fa-heart"></i></a></li>
                                            <li><a class="btn btn-success text-white mt-2" href="#"><i
                                                        class="far fa-eye"></i></a></li>
                                            <li><a class="btn btn-success text-white mt-2" href="#"><i
                                                        class="fas fa-cart-plus"></i></a></li>
                                        </ul>
                                    </div>
                                </div>
                                <div class="card-body">
                                    <router-link :to="{ name: 'productDetail', params: { productId: product.id } }"
                                        class="h3 text-decoration-none">
                                        {{ product.productName }}
                                    </router-link>
                                    <p class="text-center mb-0">${{ product.productPrice }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <ul class="pagination pagination-lg justify-content-end">
                            <li class="page-item" :class="{ disabled: currentPage === 1 }">
                                <a class="page-link rounded-0 mr-3 shadow-sm border-top-0 border-left-0 text-dark"
                                    @click.prevent="changePage(currentPage - 1)">Previous</a>
                            </li>
                            <li v-for="page in totalPages" :key="page" class="page-item"
                                :class="{ active: currentPage === page }">
                                <a class="page-link rounded-0 mr-3 shadow-sm border-top-0 border-left-0"
                                    @click.prevent="changePage(page)">{{ page }}</a>
                            </li>
                            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                                <a class="page-link rounded-0 shadow-sm border-top-0 border-left-0 text-dark"
                                    @click.prevent="changePage(currentPage + 1)">Next</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { getProducts } from '/src/api/product';
import { getCategories } from '/src/api/category';

export default {
    data() {
        return {
            products: [],
            categories: [],
            currentPage: 1,
            totalPages: 1,
            selectedCategory: null,
            searchKeyword: null, // Thêm biến searchKeyword
        };
    },
    mounted() {
        this.searchKeyword = this.$route.query.keyword; // Lấy từ khóa từ query params
        this.Products();
        this.Categories();
    },
    watch: {
        '$route.query.keyword': function (newKeyword) {
            this.searchKeyword = newKeyword;
            this.currentPage = 1;
            this.Products();
        },
        selectedCategory: function () {
            this.currentPage = 1;
            this.Products();
        }
    },
    methods: {
        async Products() {
            try {
                const data = await getProducts(this.currentPage, 6, this.selectedCategory, this.searchKeyword); // Truyền searchKeyword
                console.log("API Data:", data);
                this.products = data.products;
                this.totalPages = data.totalPages;
            } catch (error) {
                console.error('Failed to fetch products:', error);
            }
        },
        async changePage(page) {
            if (page >= 1 && page <= this.totalPages) {
                this.currentPage = page;
                console.log("Current Page:", this.currentPage);
                try {
                    await this.Products();
                } catch (error) {
                    console.error("Error in changePage:", error);
                }
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
        async Categories() {
            try {
                const response = await getCategories();
                console.log("API Data :", response);
                this.categories = response.data.data; // Truy cập đúng dữ liệu
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        },
        selectCategory(categoryId) {
            this.selectedCategory = categoryId;
        },
    },
};
</script>

<style></style>