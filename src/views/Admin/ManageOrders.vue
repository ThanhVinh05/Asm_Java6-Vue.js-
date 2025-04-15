<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { updateOrderStatus, getUserByOrder, getOrderDetails, getOrdersByUserId } from '../../api/order';
import { updateProductStock } from '../../api/product';
import Swal from 'sweetalert2';
import axios from 'axios';
import { tokenService } from '../../utils/tokenService';

// Cấu hình API URL cơ sở cho axios
axios.defaults.baseURL = 'http://localhost:8080';

const store = useStore();
const router = useRouter();

// State
const orders = ref([]);
const users = ref({});
const loading = ref(true);
const error = ref(null);
const processingAction = ref({});
const searchTerm = ref('');
const statusFilter = ref('ALL');
const sortOption = ref('newest');
const currentPage = ref(1);
const itemsPerPage = ref(10);
const serverTotalOrders = ref(0);

// Computed
const totalPages = computed(() => {
    return Math.ceil(serverTotalOrders.value / itemsPerPage.value);
});

// Methods
const fetchOrders = async (page = currentPage.value) => {
    try {
        loading.value = true;
        error.value = null;
        currentPage.value = page;

        const token = tokenService.getToken();
        if (!token) {
            error.value = 'Bạn cần đăng nhập để xem đơn hàng';
            loading.value = false;
            return;
        }

        let sortParam = 'createdAt:desc';
        switch (sortOption.value) {
            case 'oldest': sortParam = 'createdAt:asc'; break;
            case 'highestAmount': sortParam = 'totalAmount:desc'; break;
            case 'lowestAmount': sortParam = 'totalAmount:asc'; break;
        }

        const params = {
            page: currentPage.value,
            size: itemsPerPage.value,
            sort: sortParam,
            keyword: searchTerm.value || null,
            status: statusFilter.value !== 'ALL' ? statusFilter.value : null,
        };

        Object.keys(params).forEach(key => {
            if (params[key] === null || params[key] === '') {
                delete params[key];
            }
        });

        console.log('Fetching orders with params:', params);

        const response = await axios.get('/order/list', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            params: params
        });

        console.log('API Response:', response.data);

        if (response.data && response.data.status === 200) {
            const responseData = response.data.data;

            if (responseData && responseData.orders) {
                orders.value = responseData.orders || [];
                serverTotalOrders.value = responseData.totalElements || 0;
            } else {
                orders.value = [];
                serverTotalOrders.value = 0;
                console.error('Unexpected response format:', responseData);
            }

            fetchUserInfoForCurrentPage();
        } else {
            throw new Error(response.data?.message || 'Không thể tải danh sách đơn hàng');
        }
    } catch (err) {
        console.error('Error fetching orders:', err);
        if (err.response) {
            error.value = `Lỗi từ server: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`;
        } else if (err.request) {
            error.value = 'Không nhận được phản hồi từ server. Kiểm tra kết nối mạng.';
        } else {
            error.value = `Lỗi khi gửi yêu cầu: ${err.message}`;
        }
        orders.value = [];
        serverTotalOrders.value = 0;
    } finally {
        loading.value = false;
    }
};

const fetchUserInfoForCurrentPage = async () => {
    try {
        const userPromises = orders.value.map(async (order) => {
            if (!users.value[order.id]) {
                try {
                    const response = await getUserByOrder(order.id);
                    if (response && response.status === 200) {
                        users.value[order.id] = response.data;
                    }
                } catch (error) {
                    console.error(`Error fetching user for order ${order.id}:`, error);
                    users.value[order.id] = { username: 'N/A', email: 'N/A' };
                }
            }
        });
        await Promise.all(userPromises);
    } catch (error) {
        console.error('Error fetching users for current page:', error);
    }
};

const handleSearch = () => {
    fetchOrders(1);
};

const filterByStatus = () => {
    fetchOrders(1);
};

const handleSort = () => {
    fetchOrders(1);
};

const changePage = (page) => {
    if (page < 1 || page > totalPages.value || page === currentPage.value) return;
    fetchOrders(page);
};

const refreshOrders = async () => {
    await fetchOrders(1);
};

const handleStatusUpdate = async (orderId, newStatus) => {
    try {
        processingAction.value = { ...processingAction.value, [orderId]: true };

        const result = await Swal.fire({
            title: 'Xác nhận thay đổi trạng thái',
            text: `Bạn có chắc muốn chuyển đơn hàng sang trạng thái "${getStatusText(newStatus)}"?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Xác nhận',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            if (newStatus === 'SHIPPING') {
                try {
                    const orderDetails = await getOrderDetails(orderId);
                    if (orderDetails && orderDetails.orderDetails && orderDetails.orderDetails.length > 0) {
                        for (const item of orderDetails.orderDetails) {
                            if (item.productId) {
                                await updateProductStock(item.productId, item.quantity);
                            } else {
                                console.warn(`Product ID missing for order detail item: ${item.id}`);
                            }
                        }
                        console.log('Successfully updated product stock quantities');
                    } else {
                        console.warn(`No order details found for order ${orderId} to update stock.`);
                    }
                } catch (stockError) {
                    console.error('Error updating product stock:', stockError);
                    Swal.fire({
                        icon: 'warning',
                        title: 'Cảnh báo',
                        text: 'Có lỗi khi cập nhật số lượng tồn kho. Vui lòng kiểm tra lại.',
                        timer: 3000
                    });
                }
            }

            const token = tokenService.getToken();
            const response = await axios.put(`/order/${orderId}/status`, { status: newStatus }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data && response.data.status === 200) {
                const orderIndex = orders.value.findIndex(o => o.id === orderId);
                if (orderIndex !== -1) {
                    orders.value[orderIndex].status = newStatus;
                    orders.value[orderIndex].updatedAt = new Date().toISOString();
                }

                Swal.fire({
                    icon: 'success',
                    title: 'Thành công!',
                    text: `Đơn hàng đã được chuyển sang trạng thái "${getStatusText(newStatus)}"`,
                    timer: 1500
                });
            } else {
                throw new Error('Cập nhật trạng thái không thành công');
            }
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: error.message || 'Không thể cập nhật trạng thái đơn hàng'
        });
    } finally {
        processingAction.value = { ...processingAction.value, [orderId]: false };
    }
};

const getStatusClass = (status) => {
    switch (status) {
        case 'PENDING': return 'bg-warning';
        case 'CONFIRMED': return 'bg-info';
        case 'SHIPPING': return 'bg-primary';
        case 'COMPLETED': return 'bg-success';
        case 'CANCELLED': return 'bg-danger';
        default: return 'bg-secondary';
    }
};

const getStatusText = (status) => {
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
        case 'SHIPPING': return 'COMPLETED';
        default: return null;
    }
};

const canUpdateStatus = (status) => {
    return ['PENDING', 'CONFIRMED'].includes(status);
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
};

const formatPaymentMethod = (method) => {
    switch (method) {
        case 'COD':
            return 'Thanh toán khi nhận hàng';
        case 'BANK':
            return 'Chuyển khoản ngân hàng';
        case 'MOMO':
            return 'Ví Momo';
        case 'BANK_TRANSFER':
            return 'Chuyển khoản ngân hàng';
        default:
            return method;
    }
};

onMounted(() => {
    fetchOrders(1);
});
</script>

<template>
    <div class="container-fluid p-4">
        <div class="card shadow-sm">
            <div class="card-header bg-primary text-white">
                <h3 class="mb-0">Quản lý đơn hàng</h3>
            </div>
            <div class="card-body">
                <div class="row mb-4">
                    <div class="col-md-4">
                        <div class="input-group">
                            <input type="text" class="form-control" placeholder="Tìm theo ID đơn hàng..."
                                v-model="searchTerm" @input="handleSearch">
                            <button class="btn btn-outline-secondary" type="button">
                                <i class="fas fa-search"></i>
                            </button>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <select class="form-select" v-model="statusFilter" @change="filterByStatus">
                            <option value="ALL">Tất cả trạng thái</option>
                            <option value="PENDING">Chờ xác nhận</option>
                            <option value="CONFIRMED">Đã xác nhận</option>
                            <option value="SHIPPING">Đang giao hàng</option>
                            <option value="COMPLETED">Hoàn thành</option>
                            <option value="CANCELLED">Đã hủy</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <select class="form-select" v-model="sortOption" @change="handleSort">
                            <option value="newest">Mới nhất</option>
                            <option value="oldest">Cũ nhất</option>
                            <option value="highestAmount">Giá trị cao nhất</option>
                            <option value="lowestAmount">Giá trị thấp nhất</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <button class="btn btn-outline-primary w-100" @click="refreshOrders" :disabled="loading">
                            <i class="fas fa-sync-alt me-1"></i> Làm mới
                        </button>
                    </div>
                </div>

                <div v-if="loading" class="text-center my-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2">Đang tải danh sách đơn hàng...</p>
                </div>

                <div v-else-if="error" class="alert alert-danger">
                    {{ error }}
                </div>

                <div v-else-if="orders.length > 0" class="table-responsive">
                    <table class="table table-hover align-middle">
                        <thead class="table-light">
                            <tr>
                                <th>ID</th>
                                <th>Ngày đặt</th>
                                <th>Khách hàng</th>
                                <th>Tổng tiền</th>
                                <th>Trạng thái</th>
                                <th>Thanh toán</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="order in orders" :key="order.id">
                                <td>{{ order.id }}</td>
                                <td>
                                    {{ new Date(order.createdAt).toLocaleDateString('vi-VN') }}
                                    <br>
                                    <small class="text-muted">
                                        {{ new Date(order.createdAt).toLocaleTimeString('vi-VN') }}
                                    </small>
                                </td>
                                <td>
                                    <div v-if="users[order.id] && users[order.id].username !== 'N/A'">
                                        {{ users[order.id].username }}
                                        <br>
                                        <small class="text-muted">{{ users[order.id].email }}</small>
                                    </div>
                                    <div v-else-if="users[order.id] && users[order.id].username === 'N/A'">
                                        <span class="text-muted">Không lấy được TT</span>
                                    </div>
                                    <div v-else class="placeholder-glow">
                                        <span class="placeholder col-7"></span>
                                        <br>
                                        <span class="placeholder col-9"></span>
                                    </div>
                                </td>
                                <td>
                                    <span class="fw-bold">
                                        {{ formatCurrency(order.totalAmount) }}
                                    </span>
                                </td>
                                <td>
                                    <span class="badge" :class="getStatusClass(order.status)">
                                        {{ getStatusText(order.status) }}
                                    </span>
                                </td>
                                <td>
                                    <span>{{ formatPaymentMethod(order.paymentMethod) }}</span>
                                </td>
                                <td>
                                    <div class="d-flex gap-2">
                                        <router-link :to="`/admin/orders/${order.id}`"
                                            class="btn btn-sm btn-info text-white">
                                            <i class="fas fa-eye"></i>
                                        </router-link>

                                        <button v-if="canUpdateStatus(order.status)" class="btn btn-sm btn-success"
                                            @click="handleStatusUpdate(order.id, getNextStatus(order.status))"
                                            :disabled="processingAction[order.id]">
                                            <span v-if="processingAction[order.id]"
                                                class="spinner-border spinner-border-sm" role="status"></span>
                                            <i v-else class="fas fa-arrow-right"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div v-else class="text-center my-5">
                    <i class="fas fa-box-open fa-3x text-muted mb-3"></i>
                    <h5>Không có đơn hàng nào</h5>
                    <p class="text-muted">Chưa có đơn hàng nào phù hợp với bộ lọc hiện tại</p>
                </div>

                <div v-if="!loading && serverTotalOrders > 0"
                    class="d-flex justify-content-between align-items-center mt-4">
                    <div>
                        <span class="text-muted">Hiển thị {{ orders.length }} / {{ serverTotalOrders }} đơn
                            hàng</span>
                    </div>
                    <nav v-if="totalPages > 1" aria-label="Page navigation">
                        <ul class="pagination mb-0">
                            <li class="page-item" :class="{ disabled: currentPage <= 1 }">
                                <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">
                                    <i class="fas fa-chevron-left"></i>
                                </a>
                            </li>
                            <li v-for="page in totalPages" :key="page" class="page-item"
                                :class="{ active: page === currentPage }">
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
            </div>
        </div>
    </div>
</template>

<style scoped>
.badge {
    font-size: 0.9rem;
    padding: 0.5rem 1rem;
}

.pagination .page-link {
    border-radius: 0.25rem;
    margin: 0 2px;
    color: #0d6efd;
    transition: all 0.2s ease-in-out;
}

.pagination .page-item.active .page-link {
    background-color: #0d6efd;
    border-color: #0d6efd;
    color: white;
    z-index: 3;
}

.pagination .page-item.disabled .page-link {
    color: #6c757d;
    pointer-events: none;
    background-color: #fff;
    border-color: #dee2e6;
}

.pagination .page-link:hover {
    background-color: #e9ecef;
    border-color: #dee2e6;
}
</style>