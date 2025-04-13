<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { getCategories, createCategory, deleteCategory, updateCategory } from '../../api/category';
import { tokenService } from '../../utils/tokenService';
import Swal from 'sweetalert2';

const router = useRouter();
const store = useStore();
const categories = ref([]);
const loading = ref(true);
const newCategory = ref('');
const editingCategory = ref(null);
const errors = ref({});

// Watch for changes in categories for debugging
watch(categories, (newVal) => {
    console.log("Categories updated:", newVal);
}, { deep: true });

// Fetch categories from API
const fetchCategories = async () => {
    try {
        loading.value = true;
        console.log("Fetching categories...");

        // Check token before API call
        const token = tokenService.getToken();
        const isAdmin = tokenService.hasRole('ADMIN');

        if (!token || !isAdmin) {
            Swal.fire({
                icon: 'error',
                title: 'Không có quyền',
                text: 'Bạn không có quyền truy cập chức năng này',
            });
            return;
        }

        const response = await getCategories();
        console.log("Categories API response:", response);

        if (response && response.data && Array.isArray(response.data)) {
            categories.value = response.data;
        } else if (response && Array.isArray(response)) {
            categories.value = response;
        } else {
            categories.value = [];
            console.error("Unexpected response format:", response);
        }
    } catch (error) {
        console.error('Error fetching categories:', error);
        Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: error.message || 'Không thể tải danh mục. Vui lòng thử lại sau.'
        });
    } finally {
        loading.value = false;
    }
};

// Add new category
const addCategory = async () => {
    if (!newCategory.value.trim()) {
        errors.value.newCategory = 'Tên danh mục không được để trống';
        return;
    }

    errors.value.newCategory = '';

    try {
        loading.value = true;
        const reqData = { categoryName: newCategory.value.trim() };
        console.log("Creating new category:", reqData);

        const response = await createCategory(reqData);
        console.log("Create category response:", response);

        Swal.fire({
            icon: 'success',
            title: 'Thành công',
            text: 'Đã thêm danh mục mới',
            timer: 1500
        });

        newCategory.value = '';
        await fetchCategories();
        await updateProductCounts(); // Cập nhật số lượng sản phẩm
    } catch (error) {
        console.error('Error adding category:', error);
        Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: error.message || 'Không thể thêm danh mục. Vui lòng thử lại sau.'
        });
    } finally {
        loading.value = false;
    }
};

// Start editing category
const startEditingCategory = (category) => {
    editingCategory.value = {
        id: category.id,
        categoryName: category.categoryName || category.name
    };
};

// Cancel editing
const cancelEditing = () => {
    editingCategory.value = null;
};

// Save edited category
const saveCategory = async () => {
    if (!editingCategory.value.categoryName.trim()) {
        errors.value.editCategory = 'Tên danh mục không được để trống';
        return;
    }

    errors.value.editCategory = '';

    try {
        loading.value = true;
        console.log("Updating category:", editingCategory.value);

        await updateCategory(editingCategory.value.id, {
            id: editingCategory.value.id,
            categoryName: editingCategory.value.categoryName.trim()
        });

        Swal.fire({
            icon: 'success',
            title: 'Thành công',
            text: 'Đã cập nhật danh mục',
            timer: 1500
        });

        editingCategory.value = null;
        await fetchCategories();
        await updateProductCounts(); // Cập nhật số lượng sản phẩm
    } catch (error) {
        console.error('Error updating category:', error);
        Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: error.message || 'Không thể cập nhật danh mục. Vui lòng thử lại sau.'
        });
    } finally {
        loading.value = false;
    }
};

// Delete category with confirmation
const confirmDeleteCategory = async (categoryId) => {
    try {
        const result = await Swal.fire({
            title: 'Xác nhận xóa?',
            text: "Bạn có chắc chắn muốn xóa danh mục này không? Các sản phẩm liên quan có thể bị ảnh hưởng.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            loading.value = true;
            console.log("Deleting category ID:", categoryId);

            await deleteCategory(categoryId);

            Swal.fire({
                icon: 'success',
                title: 'Đã xóa!',
                text: 'Danh mục đã được xóa thành công',
                timer: 1500
            });

            await fetchCategories();
            await updateProductCounts(); // Cập nhật số lượng sản phẩm
        }
    } catch (error) {
        console.error('Error deleting category:', error);
        Swal.fire({
            icon: 'error',
            title: 'Lỗi!',
            text: error.message || 'Không thể xóa danh mục. Vui lòng thử lại sau.'
        });
    } finally {
        loading.value = false;
    }
};

// Kiểm tra cập nhật danh mục từ store để đồng bộ
const syncWithStore = async () => {
    try {
        const storeResponse = await store.dispatch('categories/fetchAllCategories');
        console.log("Store categories response:", storeResponse);
    } catch (error) {
        console.error("Error syncing with store:", error);
    }
};

// Hàm kiểm tra số lượng sản phẩm trong danh mục
const getProductCount = (category) => {
    // Nếu đã có dữ liệu productCount (đã được cập nhật bởi updateProductCounts)
    if (category.productCount !== undefined) {
        return category.productCount;
    }

    // Nếu chưa có productCount, tính toán tại chỗ
    try {
        const categoryId = category.id;
        if (!categoryId) return 0;

        const products = store.state.products?.products || [];
        if (!products.length) return 0;

        // Đếm sản phẩm có categoryId tương ứng
        return products.filter(p => p.categoryId === categoryId).length;
    } catch (error) {
        console.error('Error counting products for category:', category.id, error);
        return 0;
    }
};

// Load products để tính toán số lượng sản phẩm trong mỗi danh mục
const loadProducts = async () => {
    try {
        console.log("Loading products for category count...");
        // Nếu store chưa có danh sách sản phẩm, lấy từ API
        if (!store.state.products?.products || store.state.products.products.length === 0) {
            await store.dispatch('products/fetchAllProducts');
            console.log("Products loaded from API for category count");
        } else {
            console.log("Using cached products for category count");
        }
    } catch (error) {
        console.error('Error loading products:', error);
    }
};

// Cập nhật số lượng sản phẩm trong danh mục
const updateProductCounts = async () => {
    try {
        // Đảm bảo đã tải danh sách sản phẩm
        await loadProducts();

        // Tính toán số lượng sản phẩm cho mỗi danh mục dựa trên dữ liệu sản phẩm
        const products = store.state.products?.products || [];
        console.log(`Calculating product counts for ${categories.value.length} categories based on ${products.length} products`);

        // Đếm số lượng sản phẩm cho mỗi danh mục
        const productCounts = {};
        products.forEach(product => {
            if (product.categoryId) {
                productCounts[product.categoryId] = (productCounts[product.categoryId] || 0) + 1;
            }
        });

        // Cập nhật số lượng sản phẩm vào danh mục
        categories.value.forEach(category => {
            const categoryId = category.id;
            if (categoryId) {
                // Lưu lại giá trị cũ nếu đã có
                const oldCount = category.productCount || 0;
                // Cập nhật với giá trị mới hoặc giữ nguyên nếu không tìm thấy
                category.productCount = productCounts[categoryId] || oldCount;
            }
        });

        console.log("Updated product counts:", productCounts);
    } catch (error) {
        console.error('Error updating product counts:', error);
    }
};

// Cập nhật onMounted để lấy thêm danh sách sản phẩm
onMounted(async () => {
    console.log("ManageCategories component mounted");

    // Kiểm tra token và quyền admin
    const token = tokenService.getToken();
    const isAdmin = tokenService.hasRole('ADMIN');
    console.log("Auth check - Token exists:", !!token);
    console.log("Auth check - Is admin:", isAdmin);

    if (!token) {
        Swal.fire({
            icon: 'error',
            title: 'Chưa đăng nhập',
            text: 'Bạn cần đăng nhập để truy cập trang này',
            timer: 2000
        });
        setTimeout(() => {
            router.push('/login');
        }, 2000);
        return;
    }

    if (!isAdmin) {
        Swal.fire({
            icon: 'error',
            title: 'Không có quyền',
            text: 'Bạn không có quyền truy cập trang này',
            timer: 2000
        });
        setTimeout(() => {
            router.push('/');
        }, 2000);
        return;
    }

    // Lấy danh mục và sản phẩm song song
    try {
        await Promise.all([
            fetchCategories(),
            syncWithStore(),
            loadProducts()
        ]);
        await updateProductCounts();
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});
</script>

<template>
    <div
        class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 class="h2">Quản Lý Danh Mục</h1>
    </div>

    <!-- Add Category Form -->
    <div class="row mb-4">
        <div class="col-md-6">
            <div class="card shadow-sm">
                <div class="card-body">
                    <h5 class="card-title mb-3">Thêm Danh Mục Mới</h5>
                    <div class="input-group">
                        <input type="text" class="form-control" v-model="newCategory"
                            placeholder="Nhập tên danh mục mới" @keyup.enter="addCategory"
                            :class="{ 'is-invalid': errors.newCategory }">
                        <button class="btn btn-primary" @click="addCategory" :disabled="loading">
                            <span v-if="loading" class="spinner-border spinner-border-sm me-1" role="status"
                                aria-hidden="true"></span>
                            <i v-else class="fas fa-plus me-1"></i> Thêm Danh Mục
                        </button>
                    </div>
                    <div class="invalid-feedback d-block" v-if="errors.newCategory">
                        {{ errors.newCategory }}
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Categories Table -->
    <div class="card shadow-sm">
        <div class="card-body">
            <h5 class="card-title mb-3">Danh Sách Danh Mục</h5>

            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tên Danh Mục</th>
                            <th>Số Lượng Sản Phẩm <i class="fas fa-info-circle ms-1"
                                    title="Số lượng sản phẩm thuộc danh mục này"></i></th>
                            <th>Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="loading">
                            <td colspan="4" class="text-center">
                                <div class="spinner-border" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                            </td>
                        </tr>
                        <tr v-else-if="categories.length === 0">
                            <td colspan="4" class="text-center">
                                Không tìm thấy danh mục nào. Vui lòng thêm danh mục mới.
                            </td>
                        </tr>
                        <template v-else v-for="category in categories" :key="category.id">
                            <!-- Normal View Mode -->
                            <tr v-if="!editingCategory || editingCategory.id !== category.id">
                                <td>{{ category.id }}</td>
                                <td>{{ category.categoryName || category.name }}</td>
                                <td class="ps-5 font-weight-bold">
                                    <span :class="[
                                        'badge rounded-pill',
                                        getProductCount(category) > 0 ? 'bg-success' : 'bg-secondary',
                                        'text-white'
                                    ]"
                                        :title="`Có ${getProductCount(category)} sản phẩm thuộc danh mục '${category.categoryName || category.name}'`">
                                        {{ getProductCount(category) }}
                                    </span>
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-primary me-1" @click="startEditingCategory(category)">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-danger" @click="confirmDeleteCategory(category.id)">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                            <!-- Edit Mode -->
                            <tr v-else>
                                <td>{{ category.id }}</td>
                                <td>
                                    <input type="text" class="form-control form-control-sm"
                                        v-model="editingCategory.categoryName"
                                        :class="{ 'is-invalid': errors.editCategory }">
                                    <div class="invalid-feedback" v-if="errors.editCategory">
                                        {{ errors.editCategory }}
                                    </div>
                                </td>
                                <td>
                                    <span :class="[
                                        'badge rounded-pill',
                                        getProductCount(category) > 0 ? 'bg-success' : 'bg-secondary',
                                        'text-white'
                                    ]"
                                        :title="`Có ${getProductCount(category)} sản phẩm thuộc danh mục '${category.categoryName || category.name}'`">
                                        {{ getProductCount(category) }}
                                    </span>
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-success me-1" @click="saveCategory">
                                        <i class="fas fa-save"></i>
                                    </button>
                                    <button class="btn btn-sm btn-secondary" @click="cancelEditing">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<style scoped>
.card {
    border-radius: 0.5rem;
    margin-bottom: 1.5rem;
}

.card-title {
    color: #333;
    font-weight: 600;
}

.table-responsive {
    background-color: white;
    border-radius: 0.25rem;
}

.input-group {
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.table th {
    font-weight: 600;
}

.btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
}

.btn-primary {
    background-color: #6366f1;
    border-color: #6366f1;
}

.btn-primary:hover {
    background-color: #4f46e5;
    border-color: #4f46e5;
}

.btn-danger {
    background-color: #ef4444;
    border-color: #ef4444;
}

.btn-danger:hover {
    background-color: #dc2626;
    border-color: #dc2626;
}

.invalid-feedback {
    display: block;
}
</style>