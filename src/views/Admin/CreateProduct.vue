<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { getCategories } from '../../api/category';
import { tokenService } from '../../utils/tokenService';

const router = useRouter();
const store = useStore();
const loading = ref(false);
const categories = ref([]);

// Product form data
const product = ref({
    productName: '',
    description: '',
    productPrice: 0,
    stockQuantity: 0,
    image: '[]', // Initialize as empty JSON array string
    categoryId: null
});

// Image handling
const previewImages = ref([]);
// Main displayed image
const mainImage = ref('');

// Error handling
const errors = ref({});
const hasError = (field) => errors.value[field] ? true : false;

// Load categories for dropdown
const loadCategories = async () => {
    try {
        // Đầu tiên thử lấy từ API trực tiếp
        const response = await getCategories();
        console.log("API Categories response:", response);

        // Nếu API trực tiếp không trả về dữ liệu, thử lấy từ Vuex store
        if (!response || !response.data || categories.value.length === 0) {
            console.log("Trying to get categories from Vuex store...");
            const storeResponse = await store.dispatch('categories/fetchAllCategories');
            console.log("Vuex categories response:", storeResponse);

            if (storeResponse && storeResponse.data) {
                categories.value = storeResponse.data;
            }
        } else {
            // Xử lý dữ liệu từ API trực tiếp
            if (response && response.data && response.data.data) {
                categories.value = response.data.data;
            } else if (response && response.data) {
                categories.value = response.data;
            } else {
                categories.value = response || [];
            }
        }

        console.log("Final loaded categories:", categories.value);
    } catch (error) {
        console.error('Error loading categories:', error);
        errors.value.submit = 'Không thể tải danh mục sản phẩm';
    }
};

// Set a specific image as the main image
const setMainImage = (image) => {
    mainImage.value = image.url;
};

// Image handling
const handleImageChange = (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Add to existing selected files
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();

        reader.onload = (e) => {
            // Add to preview
            const newImage = {
                name: file.name,
                url: e.target.result
            };
            previewImages.value.push(newImage);

            // If this is the first image, set it as the main image
            if (previewImages.value.length === 1) {
                setMainImage(newImage);
            }

            // Convert image array to JSON string for the API
            updateImageField();
        };

        reader.readAsDataURL(file);
    }
};

// Remove an image from the preview list
const removeImage = (index) => {
    // If removing the main image, update the main image
    if (previewImages.value[index].url === mainImage.value) {
        // If there are other images, set the first one as main
        if (previewImages.value.length > 1) {
            const nextIndex = index === 0 ? 1 : 0;
            setMainImage(previewImages.value[nextIndex]);
        } else {
            mainImage.value = '';
        }
    }

    previewImages.value.splice(index, 1);
    updateImageField();
};

// Update the image field in the product object
const updateImageField = () => {
    // For this example, we'll just use the file names as the server expects
    const imageNames = previewImages.value.map(img => {
        // Extract filename from data URL if needed
        // For a real implementation, you'd handle server upload and get filenames
        const filename = img.name;
        return filename;
    });

    product.value.image = JSON.stringify(imageNames);
};

// Validate form before submission
const validateForm = () => {
    const newErrors = {};

    if (!product.value.productName.trim()) {
        newErrors.productName = 'Tên sản phẩm không được để trống';
    }

    if (!product.value.description.trim()) {
        newErrors.description = 'Mô tả không được để trống';
    }

    if (!product.value.productPrice || product.value.productPrice <= 0) {
        newErrors.productPrice = 'Giá phải lớn hơn 0';
    }

    if (product.value.stockQuantity === undefined || product.value.stockQuantity === null || product.value.stockQuantity < 0) {
        newErrors.stockQuantity = 'Số lượng phải lớn hơn hoặc bằng 0';
    }

    if (!product.value.categoryId) {
        newErrors.categoryId = 'Vui lòng chọn loại sản phẩm';
    }

    if (previewImages.value.length === 0) {
        newErrors.image = 'Vui lòng chọn ít nhất một ảnh';
    }

    errors.value = newErrors;
    return Object.keys(newErrors).length === 0;
};

// Submit the form
const submitForm = async () => {
    if (!validateForm()) return;

    try {
        loading.value = true;

        // Check authentication status before submission
        const token = tokenService.getToken();
        const isAdmin = tokenService.hasRole('ADMIN');
        console.log("Auth check - Token exists:", !!token);
        console.log("Auth check - Is admin:", isAdmin);

        if (!token) {
            errors.value.submit = 'Bạn cần đăng nhập để thực hiện chức năng này.';
            return;
        }

        if (!isAdmin) {
            errors.value.submit = 'Bạn không có quyền thực hiện chức năng này.';
            return;
        }

        console.log("Creating product with data:", product.value);
        const result = await store.dispatch('products/createProduct', product.value);

        console.log("Product created response:", result);
        if (result && (result.success || result.data)) {
            router.push('/admin/products');
        } else {
            errors.value.submit = 'Không thể tạo sản phẩm. Phản hồi không hợp lệ từ server.';
        }
    } catch (error) {
        console.error('Error creating product:', error);
        errors.value.submit = error.message || 'Không thể tạo sản phẩm. Vui lòng thử lại.';
    } finally {
        loading.value = false;
    }
};

// Watch cho các thay đổi trong product để debug
watch(product, (newVal) => {
    console.log("Product data changed:", newVal);
}, { deep: true });

onMounted(async () => {
    console.log("CreateProduct component mounted");

    // Kiểm tra token và quyền admin
    const token = tokenService.getToken();
    const isAdmin = tokenService.hasRole('ADMIN');
    console.log("Authentication check on mount - Token exists:", !!token);
    console.log("Authentication check on mount - Is admin:", isAdmin);

    if (!token) {
        errors.value.submit = 'Bạn cần đăng nhập để thực hiện chức năng này.';
        // Chuyển hướng đến trang đăng nhập
        setTimeout(() => {
            router.push('/login');
        }, 2000);
        return;
    }

    if (!isAdmin) {
        errors.value.submit = 'Bạn không có quyền thực hiện chức năng này.';
        // Chuyển hướng đến trang chính
        setTimeout(() => {
            router.push('/');
        }, 2000);
        return;
    }

    console.log("Current store state:", store.state);
    await loadCategories();
});
</script>

<template>
    <div
        class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 class="h2">Thêm Sản Phẩm Mới</h1>
        <div class="btn-toolbar mb-2 mb-md-0">
            <router-link to="/admin/products" class="btn btn-sm btn-outline-secondary">
                <i class="fas fa-arrow-left me-1"></i> Quay Lại
            </router-link>
        </div>
    </div>

    <div class="row">
        <div class="col-md-8">
            <div class="card shadow-sm">
                <div class="card-body">
                    <form @submit.prevent="submitForm">
                        <!-- Product Name -->
                        <div class="mb-3">
                            <label for="productName" class="form-label">Tên Sản Phẩm*</label>
                            <input type="text" class="form-control" id="productName" v-model="product.productName"
                                :class="{ 'is-invalid': hasError('productName') }" placeholder="Nhập tên sản phẩm">
                            <div class="invalid-feedback" v-if="hasError('productName')">
                                {{ errors.productName }}
                            </div>
                        </div>

                        <!-- Product Description -->
                        <div class="mb-3">
                            <label for="productDescription" class="form-label">Mô Tả*</label>
                            <textarea class="form-control" id="productDescription" rows="4"
                                v-model="product.description" :class="{ 'is-invalid': hasError('description') }"
                                placeholder="Nhập mô tả sản phẩm"></textarea>
                            <div class="invalid-feedback" v-if="hasError('description')">
                                {{ errors.description }}
                            </div>
                        </div>

                        <div class="row">
                            <!-- Product Price -->
                            <div class="col-md-6 mb-3">
                                <label for="productPrice" class="form-label">Giá (₫)*</label>
                                <input type="number" class="form-control" id="productPrice"
                                    v-model.number="product.productPrice"
                                    :class="{ 'is-invalid': hasError('productPrice') }" step="1000" min="0">
                                <div class="invalid-feedback" v-if="hasError('productPrice')">
                                    {{ errors.productPrice }}
                                </div>
                            </div>

                            <!-- Product Stock -->
                            <div class="col-md-6 mb-3">
                                <label for="productStock" class="form-label">Số Lượng*</label>
                                <input type="number" class="form-control" id="productStock"
                                    v-model.number="product.stockQuantity"
                                    :class="{ 'is-invalid': hasError('stockQuantity') }" min="0">
                                <div class="invalid-feedback" v-if="hasError('stockQuantity')">
                                    {{ errors.stockQuantity }}
                                </div>
                            </div>
                        </div>

                        <!-- Product Category -->
                        <div class="mb-3">
                            <label for="productCategory" class="form-label">Loại Sản Phẩm*</label>
                            <div class="input-group">
                                <select class="form-select" id="productCategory" v-model="product.categoryId"
                                    :class="{ 'is-invalid': hasError('categoryId') }">
                                    <option value="">Chọn loại sản phẩm</option>
                                    <option v-for="category in categories" :key="category.id" :value="category.id">
                                        {{ category.categoryName || category.name }}
                                    </option>
                                </select>
                                <router-link to="/admin/categories" class="btn btn-outline-secondary">
                                    <i class="fas fa-plus"></i>
                                </router-link>
                            </div>
                            <div class="invalid-feedback" v-if="hasError('categoryId')">
                                {{ errors.categoryId }}
                            </div>
                            <!-- Hiển thị thông báo khi không có danh mục -->
                            <div v-if="categories.length === 0" class="alert alert-warning mt-2 mb-0 py-2">
                                <i class="fas fa-exclamation-triangle me-2"></i>
                                Không tìm thấy danh mục nào.
                                <router-link to="/admin/categories" class="alert-link">
                                    Thêm danh mục mới
                                </router-link>
                            </div>
                        </div>

                        <!-- Product Images -->
                        <div class="mb-3">
                            <label for="productImage" class="form-label">Hình Ảnh Sản Phẩm*</label>
                            <input type="file" class="form-control" id="productImage" @change="handleImageChange"
                                accept="image/*" multiple :class="{ 'is-invalid': hasError('image') }">
                            <div class="invalid-feedback" v-if="hasError('image')">
                                {{ errors.image }}
                            </div>
                            <small class="form-text text-muted">Bạn có thể chọn nhiều ảnh cùng lúc</small>
                        </div>

                        <!-- Form Buttons -->
                        <div class="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
                            <router-link to="/admin/products" class="btn btn-outline-secondary me-2">
                                Hủy
                            </router-link>
                            <button type="submit" class="btn btn-primary" :disabled="loading">
                                <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"
                                    aria-hidden="true"></span>
                                Tạo Sản Phẩm
                            </button>
                        </div>

                        <!-- Submit Error -->
                        <div class="alert alert-danger mt-3" v-if="errors.submit">
                            {{ errors.submit }}
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Image Preview -->
        <div class="col-md-4">
            <div class="card shadow-sm mb-4">
                <div class="card-header">
                    <h5 class="mb-0">Xem Trước Hình Ảnh ({{ previewImages.length }})</h5>
                </div>
                <div class="card-body">
                    <!-- Main Image -->
                    <div v-if="mainImage" class="main-image-container mb-3">
                        <img :src="mainImage" alt="Main Product Image" class="img-fluid rounded">
                    </div>

                    <!-- No Images Message -->
                    <div v-if="previewImages.length === 0" class="text-center product-image-placeholder">
                        <i class="fas fa-image fa-5x text-secondary"></i>
                        <p class="text-muted mt-2">Chưa có ảnh nào được chọn</p>
                    </div>

                    <!-- Thumbnail Images -->
                    <div v-if="previewImages.length > 0" class="product-thumbnails">
                        <h6 class="mb-2">Tất cả hình ảnh:</h6>
                        <div class="row g-2">
                            <div v-for="(img, index) in previewImages" :key="index" class="col-4">
                                <div class="thumbnail-item position-relative"
                                    :class="{ 'border-primary': img.url === mainImage }" @click="setMainImage(img)">
                                    <img :src="img.url" :alt="'Image ' + (index + 1)" class="img-fluid rounded">
                                    <button type="button"
                                        class="btn btn-danger btn-sm position-absolute end-0 top-0 m-1"
                                        @click.stop="removeImage(index)" title="Xóa ảnh">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                                <p class="text-center text-muted small mt-1 mb-0 text-truncate" :title="img.name">
                                    {{ img.name }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.product-image-placeholder {
    height: 200px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.main-image-container {
    height: 250px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 0.25rem;
    background-color: #f8f9fa;
}

.main-image-container img {
    max-height: 250px;
    object-fit: contain;
}

.thumbnail-item {
    cursor: pointer;
    border: 2px solid transparent;
    border-radius: 0.25rem;
    overflow: hidden;
    height: 80px;
    transition: all 0.2s;
}

.thumbnail-item:hover {
    border-color: #6c757d;
}

.thumbnail-item.border-primary {
    border-color: #0d6efd;
}

.thumbnail-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.product-thumbnails {
    max-height: 300px;
    overflow-y: auto;
}
</style>