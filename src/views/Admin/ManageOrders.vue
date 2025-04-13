<script setup>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { getUserByOrder } from '../../api/order';
import Swal from 'sweetalert2';

const router = useRouter();
const store = useStore();
const orders = ref([]);
const loading = ref(true);
const userInfoMap = ref({});

const fetchOrders = async () => {
    try {
        loading.value = true;
        const response = await store.dispatch('orders/fetchAllOrders');
        orders.value = response.data || [];
        console.log('Orders loaded:', orders.value);

        // Fetch user info for each order
        await fetchUsersForOrders();
    } catch (error) {
        console.error('Error fetching orders:', error);
        Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: 'Không thể tải danh sách đơn hàng'
        });
    } finally {
        loading.value = false;
    }
};

const fetchUsersForOrders = async () => {
    try {
        for (const order of orders.value) {
            if (!userInfoMap.value[order.userId]) {
                try {
                    const response = await getUserByOrder(order.id);
                    if (response && response.status === 200 && response.data) {
                        userInfoMap.value[order.userId] = response.data;
                    }
                } catch (error) {
                    console.error(`Error fetching user for order ${order.id}:`, error);
                }
            }
        }
    } catch (error) {
        console.error('Error fetching users for orders:', error);
    }
};

const getUserName = (userId) => {
    return userInfoMap.value[userId]?.username || 'Người dùng';
};

const formatPaymentMethod = (method) => {
    switch (method) {
        case 'COD': return 'Tiền mặt khi nhận hàng';
        case 'BANK': return 'Chuyển khoản ngân hàng';
        case 'MOMO': return 'Ví MoMo';
        default: return method || 'Không có thông tin';
    }
};

const getStatusBadgeClass = (status) => {
    switch (status) {
        case 'PENDING': return 'bg-warning text-dark';
        case 'CONFIRMED': return 'bg-info';
        case 'SHIPPING': return 'bg-primary';
        case 'COMPLETED': return 'bg-success';
        case 'CANCELLED': return 'bg-danger';
        default: return 'bg-secondary';
    }
};

const formatStatus = (status) => {
    switch (status) {
        case 'PENDING': return 'Chờ xác nhận';
        case 'CONFIRMED': return 'Đã xác nhận';
        case 'SHIPPING': return 'Đang giao hàng';
        case 'COMPLETED': return 'Hoàn thành';
        case 'CANCELLED': return 'Đã hủy';
        default: return status;
    }
};

const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
        case 'PENDING': return 'CONFIRMED';
        case 'CONFIRMED': return 'SHIPPING';
        default: return null;
    }
};

const getActionButtonText = (status) => {
    switch (status) {
        case 'PENDING': return 'Xác nhận';
        case 'CONFIRMED': return 'Giao hàng';
        default: return '';
    }
};

const updateOrderStatus = async (orderId, status, newStatus) => {
    try {
        // Don't allow actions on cancelled or completed orders
        if (status === 'CANCELLED' || status === 'COMPLETED') {
            return;
        }

        // For shipping orders, don't allow further actions
        if (status === 'SHIPPING') {
            return;
        }

        const result = await Swal.fire({
            title: 'Xác nhận thay đổi trạng thái',
            text: `Bạn có chắc muốn thay đổi trạng thái đơn hàng sang "${formatStatus(newStatus)}"?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Xác nhận',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            await store.dispatch('orders/updateOrderStatus', { orderId, status: newStatus });

            Swal.fire({
                icon: 'success',
                title: 'Thành công',
                text: `Trạng thái đơn hàng đã được cập nhật thành ${formatStatus(newStatus)}`,
                timer: 1500
            });

            await fetchOrders();
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: 'Không thể cập nhật trạng thái đơn hàng'
        });
    }
};

const viewOrderDetail = (orderId) => {
    router.push(`/admin/orders/${orderId}`);
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

onMounted(() => {
    fetchOrders();
});
</script>

<template>
    <div
        class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 class="h2">Quản Lý Đơn Hàng</h1>
        <div class="btn-toolbar mb-2 mb-md-0">
            <button @click="fetchOrders" class="btn btn-sm btn-outline-secondary">
                <i class="fas fa-sync-alt me-1"></i> Làm mới
            </button>
        </div>
    </div>

    <div class="card shadow-sm">
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-hover align-middle">
                    <thead class="table-light">
                        <tr>
                            <th>Mã đơn</th>
                            <th>Khách hàng</th>
                            <th>Tổng tiền</th>
                            <th>Ngày đặt</th>
                            <th>Thanh toán</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="loading">
                            <td colspan="7" class="text-center py-4">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                                <p class="mt-2">Đang tải dữ liệu...</p>
                            </td>
                        </tr>
                        <tr v-else-if="orders.length === 0">
                            <td colspan="7" class="text-center py-4">
                                <p class="mb-0">Không có đơn hàng nào</p>
                            </td>
                        </tr>
                        <tr v-else v-for="order in orders" :key="order.id">
                            <td class="fw-bold">#{{ order.id }}</td>
                            <td>{{ getUserName(order.userId) }}</td>
                            <td>{{ new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                            }).format(order.totalAmount) }}</td>
                            <td>{{ formatDate(order.createdAt) }}</td>
                            <td>{{ formatPaymentMethod(order.paymentMethod) }}</td>
                            <td>
                                <span class="badge" :class="getStatusBadgeClass(order.status)">
                                    {{ formatStatus(order.status) }}
                                </span>
                            </td>
                            <td>
                                <div class="d-flex align-items-center gap-2">
                                    <!-- Status Update Button -->
                                    <button v-if="order.status !== 'CANCELLED' &&
                                        order.status !== 'COMPLETED' &&
                                        order.status !== 'SHIPPING' &&
                                        getNextStatus(order.status)" class="btn btn-sm btn-success"
                                        @click="updateOrderStatus(order.id, order.status, getNextStatus(order.status))">
                                        {{ getActionButtonText(order.status) }}
                                    </button>

                                    <button v-else-if="order.status === 'SHIPPING'" class="btn btn-sm btn-primary"
                                        disabled>
                                        Đang giao hàng
                                    </button>

                                    <!-- View Detail Button -->
                                    <button class="btn btn-sm btn-info" @click="viewOrderDetail(order.id)">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<style scoped>
.table-responsive {
    overflow-x: auto;
}

.badge {
    font-size: 0.85rem;
    font-weight: 500;
    padding: 0.35em 0.65em;
}

.card {
    border-radius: 0.5rem;
    overflow: hidden;
}

.btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    border-radius: 0.25rem;
}
</style>