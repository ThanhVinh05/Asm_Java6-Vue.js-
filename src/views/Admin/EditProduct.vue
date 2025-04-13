<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useStore } from 'vuex';
import { getCategories } from '../../api/category';
import { tokenService } from '../../utils/tokenService';

const router = useRouter();
const route = useRoute();
const productId = route.params.id;
const store = useStore();
const loading = ref(false);
const fetchingProduct = ref(true);
const categories = ref([]);

// Product form data
const product = ref({
    id: productId,
    productName: '',
    description: '',
    productPrice: 0,
    stockQuantity: 0,
    image: '[]',
    categoryId: null
});

// Image handling
const previewImages = ref([]);
// Main displayed image
const mainImage = ref('');
// Set the main image to the first image by default
const setMainImageFromArray = () => {
    if (previewImages.value.length > 0) {
        mainImage.value = previewImages.value[0].url;
    } else {
        mainImage.value = '';
    }
};

// Error handling
const errors = ref({});
const hasError = (field) => errors.value[field] ? true : false;

// Load categories for dropdown
const loadCategories = async () => {
    try {
        const response = await getCategories();
        categories.value = response.data || [];
        console.log("Loaded categories:", categories.value);
    } catch (error) {
        console.error('Error loading categories:', error);
    }
};

// Load existing product data
const loadProduct = async () => {
    try {
        fetchingProduct.value = true;

        const response = await store.dispatch('products/fetchProductById', productId);
        console.log("Product data received:", response.data);

        if (response && response.data) {
            const productData = response.data;
            product.value = {
                id: productData.id,
                productName: productData.productName || '',
                description: productData.description || '',
                productPrice: productData.productPrice || 0,
                stockQuantity: productData.stockQuantity || 0,
                image: productData.image || '[]',
                categoryId: productData.categoryId || null
            };

            // Load existing images into preview
            try {
                const existingImages = JSON.parse(productData.image || '[]');
                previewImages.value = existingImages.map(filename => ({
                    name: filename,
                    url: `/src/assets/img/${filename}`,
                    existing: true
                }));
                // Set the main image to the first image
                setMainImageFromArray();
            } catch (error) {
                console.error('Error parsing image JSON:', error);
            }
        } else {
            router.push('/admin/products');
            errors.value.submit = 'Không tìm thấy sản phẩm';
        }
    } catch (error) {
        console.error('Error loading product:', error);
        errors.value.submit = 'Không thể tải thông tin sản phẩm. Vui lòng thử lại.';
    } finally {
        fetchingProduct.value = false;
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
                url: e.target.result,
                existing: false
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
        return img.name;
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

        console.log("Submitting product update:", product.value);
        const result = await store.dispatch('products/updateProduct', {
            id: product.value.id,
            data: product.value
        });

        console.log("Product update response:", result);
        if (result && (result.success || result.data)) {
            router.push('/admin/products');
        } else {
            errors.value.submit = 'Không thể cập nhật sản phẩm. Phản hồi không hợp lệ từ server.';
        }
    } catch (error) {
        console.error('Error updating product:', error);
        errors.value.submit = error.message || 'Không thể cập nhật sản phẩm. Vui lòng thử lại.';
    } finally {
        loading.value = false;
    }
};

onMounted(async () => {
    await Promise.all([loadCategories(), loadProduct()]);
});
</script>

<template>
    <div
        class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 class="h2">Chỉnh Sửa Sản Phẩm</h1>
        <div class="btn-toolbar mb-2 mb-md-0">
            <router-link to="/admin/products" class="btn btn-sm btn-outline-secondary">
                <i class="fas fa-arrow-left me-1"></i> Quay Lại
            </router-link>
        </div>
    </div>

    <div v-if="fetchingProduct" class="text-center p-5">
        <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Đang tải thông tin sản phẩm...</p>
    </div>

    <div v-else class="row">
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
                            <select class="form-select" id="productCategory" v-model="product.categoryId"
                                :class="{ 'is-invalid': hasError('categoryId') }">
                                <option value="">Chọn loại sản phẩm</option>
                                <option v-for="category in categories" :key="category.id" :value="category.id">
                                    {{ category.categoryName }}
                                </option>
                            </select>
                            <div class="invalid-feedback" v-if="hasError('categoryId')">
                                {{ errors.categoryId }}
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
                            <small class="form-text text-muted">Bạn có thể chọn nhiều ảnh. Để trống nếu muốn giữ ảnh
                                hiện tại.</small>
                        </div>

                        <!-- Form Buttons -->
                        <div class="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
                            <router-link to="/admin/products" class="btn btn-outline-secondary me-2">
                                Hủy
                            </router-link>
                            <button type="submit" class="btn btn-primary" :disabled="loading">
                                <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"
                                    aria-hidden="true"></span>
                                Cập Nhật Sản Phẩm
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
                                    <span v-if="img.existing" class="badge bg-info position-absolute start-0 top-0 m-1"
                                        title="Ảnh đã tải lên">
                                        <i class="fas fa-check"></i>
                                    </span>
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