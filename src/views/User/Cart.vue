<template>
    <div class="cart-container">
        <div class="container py-5">
            <div class="row justify-content-center">
                <div class="col-12">
                    <div class="card border-0 shadow-sm">
                        <div class="card-header bg-white border-0 py-4">
                            <h4 class="mb-0">
                                <i class="fas fa-shopping-cart me-2 text-success"></i>
                                Giỏ hàng của bạn
                            </h4>
                        </div>
                        <div class="card-body p-4">
                            <!-- Loading state -->
                            <div v-if="loading" class="text-center py-5">
                                <div class="spinner-border text-success" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                            </div>

                            <!-- Empty cart -->
                            <div v-else-if="!cartItems.length" class="text-center py-5">
                                <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                                <h5 class="text-muted">Giỏ hàng trống</h5>
                                <router-link to="/shop" class="btn btn-success mt-3">
                                    <i class="fas fa-store me-2"></i>Tiếp tục mua sắm
                                </router-link>
                            </div>

                            <!-- Cart items -->
                            <div v-else>
                                <div class="table-responsive">
                                    <table class="table align-middle">
                                        <thead>
                                            <tr>
                                                <th style="width: 5%">
                                                    <div class="form-check">
                                                        <input class="form-check-input" type="checkbox" id="selectAll"
                                                            v-model="selectAll" @change="toggleSelectAll">
                                                        <label class="form-check-label" for="selectAll"></label>
                                                    </div>
                                                </th>
                                                <th style="width: 40%">Sản phẩm</th>
                                                <th class="text-center" style="width: 15%">Số lượng</th>
                                                <th class="text-end" style="width: 15%">Đơn giá</th>
                                                <th class="text-end" style="width: 15%">Thành tiền</th>
                                                <th style="width: 10%"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="item in cartItems" :key="item.productId">
                                                <td>
                                                    <div class="form-check">
                                                        <input class="form-check-input" type="checkbox"
                                                            :id="'item-' + item.productId"
                                                            v-model="selectedItems[item.productId]"
                                                            @change="updateSelectedTotal">
                                                    </div>
                                                </td>
                                                <td>
                                                    <div class="d-flex align-items-center">
                                                        <img :src="getFirstImageUrl(item.product.image)"
                                                            class="img-fluid rounded"
                                                            style="width: 80px; height: 80px; object-fit: cover;"
                                                            :alt="item.product.productName">
                                                        <div class="ms-3">
                                                            <h6 class="mb-0">{{ item.product.productName }}</h6>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td class="text-center">
                                                    <div class="input-group mx-auto" style="width: 150px;">
                                                        <button class="btn btn-outline-secondary"
                                                            @click="decreaseQuantity(item)"
                                                            :disabled="item.quantity <= 1">
                                                            <i class="fas fa-minus"></i>
                                                        </button>
                                                        <input type="number" class="form-control text-center px-2"
                                                            v-model.number="item.quantity"
                                                            @change="updateQuantity(item)" min="1"
                                                            style="font-size: 1rem;">
                                                        <button class="btn btn-outline-secondary"
                                                            @click="increaseQuantity(item)">
                                                            <i class="fas fa-plus"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                                <td class="text-end">${{ item.product.productPrice.toFixed(2) }}</td>
                                                <td class="text-end">${{ (item.product.productPrice *
                                                    item.quantity).toFixed(2) }}</td>
                                                <td class="text-end">
                                                    <button class="btn btn-outline-danger btn-sm"
                                                        @click="removeItem(item.productId)">
                                                        <i class="fas fa-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <!-- Cart summary -->
                                <div class="row mt-4">
                                    <div class="col-md-6 offset-md-6">
                                        <div class="card border-0 bg-light">
                                            <div class="card-body">
                                                <h5 class="card-title mb-4">Tổng đơn hàng</h5>
                                                <div class="d-flex justify-content-between mb-2">
                                                    <span>Tạm tính ({{ selectedCount }} sản phẩm):</span>
                                                    <span>${{ selectedSubtotal.toFixed(2) }}</span>
                                                </div>
                                                <div class="d-flex justify-content-between mb-2">
                                                    <span>Phí vận chuyển:</span>
                                                    <span>${{ shippingFee.toFixed(2) }}</span>
                                                </div>
                                                <hr>
                                                <div class="d-flex justify-content-between mb-3">
                                                    <strong>Tổng cộng:</strong>
                                                    <strong class="text-success">${{ selectedTotal.toFixed(2)
                                                    }}</strong>
                                                </div>
                                                <div class="d-grid gap-2">


                                                    <!-- Bằng đoạn code này -->
                                                    <router-link to="/checkout"
                                                        :class="['btn', selectedCount > 0 ? 'btn-success' : 'btn-secondary']"
                                                        :disabled="selectedCount === 0"
                                                        @click="saveSelectedItemsToCheckout" custom
                                                        v-slot="{ navigate }">
                                                        <button @click="saveSelectedItemsToCheckout(); navigate()"
                                                            class="btn"
                                                            :class="selectedCount > 0 ? 'btn-success' : 'btn-secondary'"
                                                            :disabled="selectedCount === 0">
                                                            <i class="fas fa-check me-2"></i>Tiến hành thanh toán
                                                        </button>
                                                    </router-link>
                                                    <router-link to="/shop" class="btn btn-outline-success">
                                                        <i class="fas fa-arrow-left me-2"></i>Tiếp tục mua sắm
                                                    </router-link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>

<script>
import { ref, computed, onMounted, reactive } from 'vue';
import { getCartItems, updateCartItem, removeFromCart } from '../../api/cart';
import Swal from 'sweetalert2';
import { cartStore } from '../../store/cartStore';

export default {
    setup() {
        const loading = ref(true);
        const cartItems = ref([]);
        const shippingFee = ref(10); // Giả sử phí ship cố định là $10
        const selectedItems = reactive({});
        const selectAll = ref(false);

        // Tính tổng tiền cho các sản phẩm được chọn
        const selectedSubtotal = computed(() => {
            return cartItems.value.reduce((sum, item) => {
                if (selectedItems[item.productId]) {
                    return sum + (item.product.productPrice * item.quantity);
                }
                return sum;
            }, 0);
        });

        const selectedTotal = computed(() => {
            return selectedSubtotal.value + shippingFee.value;
        });

        const selectedCount = computed(() => {
            return Object.values(selectedItems).filter(selected => selected).length;
        });

        const subtotal = computed(() => {
            return cartItems.value.reduce((sum, item) => {
                return sum + (item.product.productPrice * item.quantity);
            }, 0);
        });

        const total = computed(() => {
            return subtotal.value + shippingFee.value;
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

        const loadCartItems = async () => {
            try {
                loading.value = true;
                const data = await getCartItems();
                cartItems.value = data;

                // Khởi tạo selectedItems
                cartItems.value.forEach(item => {
                    selectedItems[item.productId] = false;
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi',
                    text: 'Không thể tải giỏ hàng'
                });
            } finally {
                loading.value = false;
            }
        };

        const updateQuantity = async (item) => {
            try {
                await updateCartItem(item.productId, item.quantity);
                updateSelectedTotal();
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi',
                    text: 'Không thể cập nhật số lượng'
                });
                await loadCartItems(); // Reload cart if update fails
            }
        };

        const increaseQuantity = async (item) => {
            item.quantity++;
            await updateQuantity(item);
        };

        const decreaseQuantity = async (item) => {
            if (item.quantity > 1) {
                item.quantity--;
                await updateQuantity(item);
            }
        };

        const removeItem = async (productId) => {
            try {
                const result = await Swal.fire({
                    title: 'Xác nhận xóa',
                    text: 'Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Xóa',
                    cancelButtonText: 'Hủy'
                });

                if (result.isConfirmed) {
                    await removeFromCart(productId);
                    await loadCartItems();
                    await cartStore.updateCartCount();
                    Swal.fire('Đã xóa!', 'Sản phẩm đã được xóa khỏi giỏ hàng.', 'success');
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi',
                    text: 'Không thể xóa sản phẩm'
                });
            }
        };

        const toggleSelectAll = () => {
            cartItems.value.forEach(item => {
                selectedItems[item.productId] = selectAll.value;
            });
            updateSelectedTotal();
        };

        const updateSelectedTotal = () => {
            // Cập nhật trạng thái "Chọn tất cả" dựa trên các item đã chọn
            selectAll.value = cartItems.value.length > 0 &&
                cartItems.value.every(item => selectedItems[item.productId]);
        };

        const saveSelectedItemsToCheckout = () => {
            // Lọc các mục được chọn
            const itemsToCheckout = cartItems.value
                .filter(item => selectedItems[item.productId])
                .map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    product: item.product
                }));

            if (itemsToCheckout.length === 0) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Chưa chọn sản phẩm',
                    text: 'Vui lòng chọn ít nhất một sản phẩm để thanh toán'
                });
                return;
            }

            // Lưu danh sách sản phẩm đã chọn vào localStorage
            localStorage.setItem('checkoutItems', JSON.stringify(itemsToCheckout));
            localStorage.setItem('checkoutSubtotal', selectedSubtotal.value);
            localStorage.setItem('checkoutShippingFee', shippingFee.value);
            localStorage.setItem('checkoutTotal', selectedTotal.value);
        };

        onMounted(() => {
            loadCartItems();
        });

        return {
            loading,
            cartItems,
            subtotal,
            shippingFee,
            total,
            selectedItems,
            selectAll,
            selectedSubtotal,
            selectedTotal,
            selectedCount,
            getFirstImageUrl,
            updateQuantity,
            increaseQuantity,
            decreaseQuantity,
            removeItem,
            toggleSelectAll,
            updateSelectedTotal,
            saveSelectedItemsToCheckout
        };
    }
};
</script>

<style scoped>
.cart-container {
    background-color: #f8f9fa;
    min-height: 100vh;
}

.input-group .form-control {
    text-align: center;
    font-size: 1rem;
    padding: 0.5rem;
}

.input-group .btn {
    z-index: 0;
    padding: 0.5rem 1rem;
}

.card {
    border-radius: 1rem;
}

.table th {
    font-weight: 600;
    color: #495057;
    background-color: #f8f9fa;
}

.btn-outline-danger:hover {
    transform: translateY(-2px);
    transition: transform 0.2s;
}

@media (max-width: 768px) {
    .table-responsive {
        font-size: 0.9rem;
    }

    .input-group {
        width: 120px !important;
    }
}
</style>