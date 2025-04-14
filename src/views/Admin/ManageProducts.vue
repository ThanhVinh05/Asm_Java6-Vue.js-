<script setup>
import { ref, onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import { getCategories } from '../../api/category';
import { tokenService } from '../../utils/tokenService';
import Swal from 'sweetalert2';

const store = useStore();
const products = ref([]);
const categories = ref([]);
const loading = ref(true);

// Pagination state
const currentPage = ref(1);
const itemsPerPage = ref(10); // Show 10 products per page
const totalProducts = ref(0);

// Fetch products from the API
const fetchProducts = async () => {
    try {
        loading.value = true;
        const response = await store.dispatch('products/fetchAllProducts');
        products.value = response.data || [];
        totalProducts.value = products.value.length; // Update total products
        console.log('Products loaded:', products.value);

        // Also load categories to display category names
        await loadCategories();
    } catch (error) {
        console.error('Error fetching products:', error);
    } finally {
        loading.value = false;
    }
};

// Load categories to display category names
const loadCategories = async () => {
    try {
        const response = await getCategories();
        categories.value = response.data || [];
        console.log('Categories loaded:', categories.value);
    } catch (error) {
        console.error('Error loading categories:', error);
    }
};

// Get category name by ID
const getCategoryName = (categoryId) => {
    const category = categories.value.find(cat => cat.id === categoryId);
    return category ? category.categoryName : 'N/A';
};

// Get first image from image JSON array
const getFirstImage = (imageJson) => {
    try {
        const images = JSON.parse(imageJson || '[]');
        if (images && images.length > 0) {
            return `/src/assets/img/${images[0]}`;
        }
    } catch (error) {
        console.error('Error parsing image JSON:', error);
    }
    return '/src/assets/img/default-product.jpg'; // Default image if no images or error
};

// Delete a product
const deleteProduct = async (productId) => {
    // Verify user authentication and admin status
    const token = tokenService.getToken();
    const isAdmin = tokenService.hasRole('ADMIN');

    if (!token || !isAdmin) {
        Swal.fire({
            icon: 'error',
            title: 'Không có quyền',
            text: 'Bạn không có quyền thực hiện chức năng này',
        });
        return;
    }

    try {
        const result = await Swal.fire({
            title: 'Xác nhận xóa?',
            text: "Bạn có chắc chắn muốn xóa sản phẩm này không?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            console.log("Deleting product ID:", productId);
            await store.dispatch('products/deleteProduct', productId);

            Swal.fire({
                icon: 'success',
                title: 'Đã xóa!',
                text: 'Sản phẩm đã được xóa thành công',
                timer: 1500
            });

            await fetchProducts(); // Refetch products after deletion
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        Swal.fire({
            icon: 'error',
            title: 'Lỗi!',
            text: error.message || 'Không thể xóa sản phẩm. Vui lòng thử lại sau.'
        });
    }
};

// Computed property for total pages
const totalPages = computed(() => {
    return Math.ceil(totalProducts.value / itemsPerPage.value);
});

// Computed property for paginated products
const paginatedProducts = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return products.value.slice(start, end);
});

// Method to change page
const changePage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
    }
};

onMounted(() => {
    fetchProducts();
});
</script>

<template>
    <div
        class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 class="h2">Quản Lý Sản Phẩm</h1>
        <div class="btn-toolbar mb-2 mb-md-0">
            <router-link to="/admin/products/create" class="btn btn-sm btn-outline-primary">
                <i class="fas fa-plus"></i> Thêm Sản Phẩm Mới
            </router-link>
        </div>
    </div>

    <div class="table-responsive">
        <table class="table table-striped table-hover">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Hình Ảnh</th>
                    <th>Tên Sản Phẩm</th>
                    <th>Loại</th>
                    <th>Giá</th>
                    <th>Số Lượng</th>
                    <th>Thao Tác</th>
                </tr>
            </thead>
            <tbody>
                <tr v-if="loading">
                    <td colspan="7" class="text-center">
                        <div class="spinner-border" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                    </td>
                </tr>
                <tr v-else-if="paginatedProducts.length === 0">
                    <td colspan="7" class="text-center">
                        Không tìm thấy sản phẩm nào.
                    </td>
                </tr>
                <tr v-else v-for="product in paginatedProducts" :key="product.id">
                    <td>{{ product.id }}</td>
                    <td>
                        <img :src="getFirstImage(product.image)" :alt="product.productName" class="img-thumbnail"
                            style="width: 50px; height: 50px;">
                    </td>
                    <td>{{ product.productName }}</td>
                    <td>{{ getCategoryName(product.categoryId) }}</td>
                    <td>{{ product.productPrice.toLocaleString() }}₫</td>
                    <td>{{ product.stockQuantity || product.quantity || 0 }}</td>
                    <td>
                        <router-link :to="'/admin/products/edit/' + product.id" class="btn btn-sm btn-primary me-1">
                            <i class="fas fa-edit"></i>
                        </router-link>
                        <button @click="deleteProduct(product.id)" class="btn btn-sm btn-danger">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Pagination Controls -->
    <div v-if="!loading && products.length > 0" class="d-flex justify-content-between align-items-center mt-4">
        <div>
            <span class="text-muted">
                Hiển thị {{ paginatedProducts.length }} / {{ totalProducts }} sản phẩm
            </span>
        </div>
        <nav aria-label="Page navigation">
            <ul class="pagination mb-0">
                <li class="page-item" :class="{ disabled: currentPage <= 1 }">
                    <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">
                        <i class="fas fa-chevron-left"></i>
                    </a>
                </li>
                <li v-for="page in totalPages" :key="page" class="page-item" :class="{ active: page === currentPage }">
                    <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
                </li>
                <li class="page-item" :class="{ disabled: currentPage >= totalPages }">
                    <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">
                        <i class="fas fa-chevron-right"></i>
                    </a>
                </li>
            </ul>
        </nav>
    </div>
</template>

<style scoped>
.table-responsive {
    background-color: white;
    border-radius: 0.25rem;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.img-thumbnail {
    object-fit: cover;
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
</style>