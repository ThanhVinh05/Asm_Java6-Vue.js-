<template>
    <div class="orders-container"> 
        <div class="container py-5">
        <div class="row">
            <div class="col-12">
                <h1 class="display-5 fw-bold mb-4">
                    <i class="fas fa-shopping-bag text-success me-3"></i>Đơn hàng của bạn
                </h1>
            </div>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-success" role="status">
                <span class="visually-hidden">Đang tải...</span>
            </div>
        </div>

        <!-- No orders -->
        <div v-else-if="!orders.length" class="text-center py-5">
            <i class="fas fa-shopping-bag fa-3x text-muted mb-3"></i>
            <h5 class="text-muted">Bạn chưa có đơn hàng nào</h5>
            <router-link to="/shop" class="btn btn-success mt-3">
                <i class="fas fa-store me-2"></i>Tiếp tục mua sắm
            </router-link>
        </div>

        <!-- Orders list -->
        <div v-else class="row">
            <div class="col-12">
                <div class="card border-0 shadow-sm">
                    <div class="table-responsive">
                        <table class="table align-middle mb-0">
                            <thead class="bg-light">
                                <tr>
                                    <th>Mã đơn hàng</th>
                                    <th>Ngày đặt</th>
                                    <th>Phương thức thanh toán</th>
                                    <th>Trạng thái</th>
                                    <th class="text-end">Tổng tiền</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="order in sortedOrders" :key="order.id">
                                    <td>#{{ order.id }}</td>
                                    <td>{{ formatDate(order.createdAt) }}</td>
                                    <td>
                                        <span :class="getPaymentMethodBadgeClass(order.paymentMethod)">
                                            {{ formatPaymentMethod(order.paymentMethod) }}
                                        </span>
                                    </td>
                                    <td>
                                        <span :class="getStatusBadgeClass(order.status)">
                                            {{ formatStatus(order.status) }}
                                        </span>
                                    </td>
                                    <td class="text-end">${{ order.totalAmount.toFixed(2) }}</td>
                                    <td class="text-end">
                                        <button class="btn btn-sm btn-outline-primary me-2"
                                            @click="viewOrderDetails(order)">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button v-if="order.status === 'PENDING'" class="btn btn-sm btn-outline-danger"
                                            @click="confirmCancelOrder(order.id)">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Pagination -->
                <div class="d-flex justify-content-center mt-4">
                    <nav aria-label="Page navigation">
                        <ul class="pagination">
                            <li class="page-item" :class="{ disabled: currentPage === 1 }">
                                <button class="page-link" @click="changePage(currentPage - 1)">
                                    <i class="fas fa-chevron-left"></i>
                                </button>
                            </li>
                            <li v-for="page in totalPages" :key="page" class="page-item"
                                :class="{ active: currentPage === page }">
                                <button class="page-link" @click="changePage(page)">{{ page }}</button>
                            </li>
                            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                                <button class="page-link" @click="changePage(currentPage + 1)">
                                    <i class="fas fa-chevron-right"></i>
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </div>

        <!-- Order Details Modal -->
        <div class="modal fade" id="orderDetailsModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Chi tiết đơn hàng #{{ selectedOrder?.id }}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div v-if="selectedOrder">
                            <!-- Order Information -->
                            <div class="card mb-4">
                                <div class="card-body">
                                    <h6 class="card-title mb-3">Thông tin đơn hàng</h6>
                                    <div class="row">
                                        <div class="col-md-6">
                                            <p class="mb-2"><strong>Ngày đặt:</strong> {{
                                                formatDate(selectedOrder.createdAt) }}</p>
                                            <p class="mb-2">
                                                <strong>Trạng thái:</strong>
                                                <span :class="getStatusBadgeClass(selectedOrder.status)" class="ms-2">
                                                    {{ formatStatus(selectedOrder.status) }}
                                                </span>
                                            </p>
                                        </div>
                                        <div class="col-md-6">
                                            <p class="mb-2">
                                                <strong>Phương thức thanh toán:</strong>
                                                <span :class="getPaymentMethodBadgeClass(selectedOrder.paymentMethod)"
                                                    class="ms-2">
                                                    {{ formatPaymentMethod(selectedOrder.paymentMethod) }}
                                                </span>
                                            </p>
                                            <p class="mb-2"><strong>Ghi chú:</strong>
                                                {{ selectedOrder.note || 'Không có' }}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Order Details Table -->
                            <div class="card">
                                <div class="card-body">
                                    <h6 class="card-title mb-3">Chi tiết sản phẩm</h6>
                                    <div class="table-responsive">
                                        <table class="table">
                                            <thead>
                                                <tr>
                                                    <th style="width: 50%">Sản phẩm</th>
                                                    <th class="text-center">Số lượng</th>
                                                    <th class="text-end">Đơn giá</th>
                                                    <th class="text-end">Thành tiền</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr v-for="item in selectedOrder.orderDetails" :key="item.id">
                                                    <td>
                                                        <div class="d-flex align-items-center">
                                                            <img :src="getFirstImageUrl(item.product.image)"
                                                                class="img-fluid rounded me-2"
                                                                style="width: 50px; height: 50px; object-fit: cover;"
                                                                :alt="item.product.productName">
                                                            <div>
                                                                <h6 class="mb-0">{{ item.product.productName }}</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td class="text-center">{{ item.quantity }}</td>
                                                    <td class="text-end">${{ item.price.toFixed(2) }}</td>
                                                    <td class="text-end">${{ (item.price * item.quantity).toFixed(2) }}
                                                    </td>
                                                </tr>
                                            </tbody>
                                            <tfoot>
                                                <tr>
                                                    <td colspan="3" class="text-end"><strong>Tổng cộng:</strong></td>
                                                    <td class="text-end"><strong class="text-success">${{
                                                        selectedOrder.totalAmount.toFixed(2) }}</strong></td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { getUserOrders, getOrderDetails, cancelOrder } from '../api/order';
import Swal from 'sweetalert2';

export default {
    setup() {
        const loading = ref(true);
        const orders = ref([]);
        const currentPage = ref(1);
        const totalPages = ref(1);
        const selectedOrder = ref(null);
        const orderDetails = ref([]);
        let orderDetailsModal = null;

        // Thêm computed property để sắp xếp đơn hàng
        const sortedOrders = computed(() => {
            return [...orders.value].sort((a, b) => {
                const dateA = new Date(a.updatedAt || a.createdAt);
                const dateB = new Date(b.updatedAt || b.createdAt);
                return dateB - dateA;
            });
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

        const formatDate = (dateString) => {
            return new Date(dateString).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        };

        const formatPaymentMethod = (method) => {
            if (!method) return 'Không xác định';
            switch (method.toUpperCase()) {
                case 'COD': return 'Thanh toán khi nhận hàng';
                case 'BANK': return 'Chuyển khoản ngân hàng';
                case 'MOMO': return 'Ví MoMo';
                default: return method;
            }
        };

        const getPaymentMethodBadgeClass = (method) => {
            if (!method) return 'badge rounded-pill bg-secondary';
            const baseClasses = 'badge rounded-pill';
            switch (method.toUpperCase()) {
                case 'COD': return `${baseClasses} bg-success`;
                case 'BANK': return `${baseClasses} bg-primary`;
                case 'MOMO': return `${baseClasses} bg-danger`;
                default: return `${baseClasses} bg-secondary`;
            }
        };

        const formatStatus = (status) => {
            switch (status) {
                case 'PENDING': return 'Chờ xác nhận';
                case 'CONFIRMED': return 'Đã xác nhận';
                case 'SHIPPING': return 'Đang giao hàng';
                case 'DELIVERED': return 'Đã giao hàng';
                case 'COMPLETED': return 'Hoàn thành';
                case 'CANCELLED': return 'Đã hủy';
                default: return status;
            }
        };

        const getStatusBadgeClass = (status) => {
            const baseClasses = 'badge rounded-pill';
            switch (status) {
                case 'PENDING': return `${baseClasses} bg-warning text-dark`;
                case 'CONFIRMED': return `${baseClasses} bg-info`;
                case 'SHIPPING': return `${baseClasses} bg-primary`;
                case 'DELIVERED': return `${baseClasses} bg-success`;
                case 'COMPLETED': return `${baseClasses} bg-success`;
                case 'CANCELLED': return `${baseClasses} bg-danger`;
                default: return `${baseClasses} bg-secondary`;
            }
        };

        const loadOrders = async (page = 1) => {
            try {
                loading.value = true;
                console.log('Loading orders for page:', page);
                const response = await getUserOrders(page, 10);
                console.log('API Response:', response);

                if (response && response.data) {
                    if (response.data.data) {
                        const responseData = response.data.data;
                        if (Array.isArray(responseData.content)) {
                            orders.value = responseData.content;
                            totalPages.value = responseData.totalPages || 1;
                        } else if (Array.isArray(responseData)) {
                            orders.value = responseData;
                            totalPages.value = Math.ceil(responseData.length / 10);
                        } else {
                            orders.value = [responseData];
                            totalPages.value = 1;
                        }
                    } else {
                        if (Array.isArray(response.data)) {
                            orders.value = response.data;
                            totalPages.value = Math.ceil(response.data.length / 10);
                        } else if (response.data.content) {
                            orders.value = response.data.content;
                            totalPages.value = response.data.totalPages || 1;
                        } else {
                            orders.value = [response.data];
                            totalPages.value = 1;
                        }
                    }
                    currentPage.value = page;
                    console.log('Processed orders:', orders.value);
                } else {
                    orders.value = [];
                    totalPages.value = 1;
                    console.log('No orders data in response');
                }
            } catch (error) {
                console.error('Error loading orders:', error);
                orders.value = [];
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi',
                    text: error.response?.data?.message || 'Không thể tải danh sách đơn hàng'
                });
            } finally {
                loading.value = false;
            }
        };

        const changePage = (page) => {
            if (page >= 1 && page <= totalPages.value) {
                loadOrders(page);
            }
        };

        const viewOrderDetails = async (order) => {
            try {
                // Show loading indicator
                Swal.fire({
                    title: 'Đang tải...',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                console.log('Fetching order details for order:', order.id);
                const orderData = await getOrderDetails(order.id);

                // Close loading indicator
                Swal.close();

                if (!orderData || !orderData.orderDetails) {
                    throw new Error('Không thể tải thông tin chi tiết đơn hàng');
                }

                // Update selected order with full details
                selectedOrder.value = {
                    ...order,
                    ...orderData
                };

                // Show modal using Bootstrap global object
                const modalElement = document.getElementById('orderDetailsModal');
                const modal = new window.bootstrap.Modal(modalElement);
                modal.show();
            } catch (error) {
                console.error('Error loading order details:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi',
                    text: error.message || 'Không thể tải chi tiết đơn hàng. Vui lòng thử lại sau.'
                });
            }
        };

        const confirmCancelOrder = async (orderId) => {
            try {
                const result = await Swal.fire({
                    title: 'Xác nhận hủy đơn hàng?',
                    text: 'Bạn có chắc chắn muốn hủy đơn hàng này?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Hủy đơn hàng',
                    cancelButtonText: 'Không'
                });

                if (result.isConfirmed) {
                    await cancelOrder(orderId);
                    await loadOrders(currentPage.value);
                    Swal.fire('Thành công', 'Đơn hàng đã được hủy', 'success');
                }
            } catch (error) {
                console.error('Error canceling order:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi',
                    text: 'Không thể hủy đơn hàng'
                });
            }
        };

        onMounted(() => {
            loadOrders();
        });

        return {
            loading,
            orders,
            sortedOrders,
            currentPage,
            totalPages,
            selectedOrder,
            orderDetails,
            getFirstImageUrl,
            formatDate,
            formatPaymentMethod,
            formatStatus,
            getStatusBadgeClass,
            getPaymentMethodBadgeClass,
            changePage,
            viewOrderDetails,
            confirmCancelOrder
        };
    }
};
</script>

<style scoped>
.orders-container {
    background-color: #f8f9fa;
    min-height: 100vh;
}
.table th {
    font-weight: 600;
    background-color: #f8f9fa;
}

.badge {
    font-weight: 500;
    padding: 0.5em 0.75em;
}

.pagination {
    margin-bottom: 0;
}

.pagination .page-link {
    color: #198754;
    border-color: #dee2e6;
}

.pagination .page-item.active .page-link {
    background-color: #198754;
    border-color: #198754;
}

.btn-outline-primary {
    color: #0d6efd;
    border-color: #0d6efd;
}

.btn-outline-primary:hover {
    color: #fff;
    background-color: #0d6efd;
    border-color: #0d6efd;
}

.btn-outline-danger {
    color: #dc3545;
    border-color: #dc3545;
}

.btn-outline-danger:hover {
    color: #fff;
    background-color: #dc3545;
    border-color: #dc3545;
}

.modal-dialog {
    max-width: 800px;
}
</style>