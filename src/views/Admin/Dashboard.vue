<script setup>
import { ref, onMounted, computed } from 'vue';
import Chart from 'chart.js/auto';
import {
    getDashboardStats,
    getRevenueStats,
    getRecentOrders,
    getTopProducts
} from '../../api/dashboard';
import { useRouter } from 'vue-router';

// State
const stats = ref({
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    totalRevenue: 0
});
const revenueData = ref(null);
const recentOrders = ref([]);
const topProducts = ref([]);
const loading = ref({
    stats: true,
    revenue: true,
    orders: true,
    products: true
});
const error = ref({
    stats: null,
    revenue: null,
    orders: null,
    products: null
});
const recentOrdersPeriod = ref('week');

const router = useRouter();

// Thời gian
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
const selectedYear = ref(currentYear);
const selectedPeriod = ref('year');
const selectedMonth = ref(new Date().getMonth() + 1);

// Chart references
const revenueChartRef = ref(null);
let revenueChart = null;

// Format currency
const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0
    }).format(value);
};

// Format date
const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
};

// Status badge
const getStatusBadge = (status) => {
    const statusMap = {
        'PENDING': 'bg-warning text-dark',
        'CONFIRMED': 'bg-info',
        'SHIPPING': 'bg-primary',
        'DELIVERED': 'bg-success',
        'COMPLETED': 'bg-success',
        'CANCELLED': 'bg-danger'
    };
    return statusMap[status] || 'bg-secondary';
};

const formatStatus = (status) => {
    const statusMap = {
        'PENDING': 'Chờ xác nhận',
        'CONFIRMED': 'Đã xác nhận',
        'SHIPPING': 'Đang giao hàng',
        'DELIVERED': 'Đã giao hàng',
        'COMPLETED': 'Hoàn thành',
        'CANCELLED': 'Đã hủy'
    };
    return statusMap[status] || status;
}

// Load dashboard stats
const loadDashboardStats = async () => {
    loading.value.stats = true;
    error.value.stats = null;
    try {
        const response = await getDashboardStats();
        if (response && response.data) {
            stats.value = response.data;
        } else {
            throw new Error('Invalid stats data received');
        }
    } catch (err) {
        console.error('Error loading dashboard stats:', err);
        error.value.stats = err.message || 'Failed to load statistics.';
    } finally {
        loading.value.stats = false;
    }
};

// Load revenue data
const loadRevenueData = async () => {
    loading.value.revenue = true;
    error.value.revenue = null;
    try {
        const response = await getRevenueStats(selectedPeriod.value, selectedYear.value, selectedMonth.value);

        if (response && response.data) {
            revenueData.value = response.data;
        } else {
            throw new Error('Invalid revenue data received');
        }

        if (revenueChart) {
            revenueChart.destroy();
        }

        if (revenueChartRef.value) {
            renderRevenueChart();
        }
    } catch (err) {
        console.error('Error loading revenue data:', err);
        error.value.revenue = err.message || 'Failed to load revenue chart data.';
    } finally {
        loading.value.revenue = false;
    }
};

// Load recent orders
const loadRecentOrders = async () => {
    loading.value.orders = true;
    error.value.orders = null;
    try {
        const response = await getRecentOrders();
        if (response && response.data) {
            recentOrders.value = response.data;
        } else {
            throw new Error('Invalid recent orders data received');
        }
    } catch (err) {
        console.error('Error loading recent orders:', err);
        error.value.orders = err.message || 'Failed to load recent orders.';
    } finally {
        loading.value.orders = false;
    }
};

// Load top products
const loadTopProducts = async () => {
    loading.value.products = true;
    error.value.products = null;
    try {
        const response = await getTopProducts();
        if (response && response.data) {
            topProducts.value = response.data;
        } else {
            throw new Error('Invalid top products data received');
        }
    } catch (err) {
        console.error('Error loading top products:', err);
        error.value.products = err.message || 'Failed to load top products.';
    } finally {
        loading.value.products = false;
    }
};

// Render revenue chart
const renderRevenueChart = () => {
    if (!revenueData.value || !revenueChartRef.value || !revenueData.value.labels || !revenueData.value.datasets) return;

    const ctx = revenueChartRef.value.getContext('2d');

    revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: revenueData.value.labels,
            datasets: [{
                label: revenueData.value.datasets[0]?.label || 'Doanh thu',
                data: revenueData.value.datasets[0]?.data || [],
                borderColor: '#198754',
                backgroundColor: 'rgba(25, 135, 84, 0.1)',
                borderWidth: 2,
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
};

// Handle period change
const handlePeriodChange = () => {
    if (selectedPeriod.value === 'month') {
        selectedMonth.value = new Date().getMonth() + 1;
    }
    loadRevenueData();
};

// Navigate to order details
const goToOrderDetail = (orderId) => {
    router.push(`/admin/orders/${orderId}`);
};

// Filtered Recent Orders
const filteredRecentOrders = computed(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const oneDay = 24 * 60 * 60 * 1000;

    return recentOrders.value.filter(order => {
        const orderDate = new Date(order.createdAt);
        switch (recentOrdersPeriod.value) {
            case 'day':
                return orderDate >= today && orderDate < new Date(today.getTime() + oneDay);
            case 'week':
                const sevenDaysAgo = new Date(today.getTime() - 6 * oneDay);
                return orderDate >= sevenDaysAgo;
            case 'month':
                const thirtyDaysAgo = new Date(today.getTime() - 29 * oneDay);
                return orderDate >= thirtyDaysAgo;
            default:
                return true; // Should not happen, but return all if invalid period
        }
    }).slice(0, 5); // Limit display to 5 after filtering
});

// On mount
onMounted(() => {
    loadDashboardStats();
    loadRevenueData();
    loadRecentOrders();
    loadTopProducts();
});

// Computed properties
const totalRevenue = computed(() => {
    return formatCurrency(stats.value.totalRevenue || 0);
});
</script>

<template>
    <div>
        <div
            class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="h2">Dashboard</h1>
            <div class="btn-toolbar mb-2 mb-md-0">
                <div class="btn-group me-2">
                    <button type="button" class="btn btn-sm btn-outline-secondary">
                        <i class="fas fa-download me-1"></i> Export
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-secondary">
                        <i class="fas fa-print me-1"></i> Print
                    </button>
                </div>
                <button type="button" class="btn btn-sm btn-outline-secondary dropdown-toggle">
                    <i class="fas fa-calendar me-1"></i> This week
                </button>
            </div>
        </div>

        <!-- Thống kê tổng quan -->
        <div class="row">
            <!-- Thống kê đơn hàng -->
            <div class="col-xl-3 col-md-6 mb-4">
                <div class="card border-left-primary shadow h-100 py-2">
                    <div class="card-body">
                        <div class="row no-gutters align-items-center">
                            <div class="col mr-2">
                                <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                    Total Orders</div>
                                <div class="h5 mb-0 font-weight-bold text-gray-800" v-if="!loading.stats">
                                    {{ stats.totalOrders }}
                                </div>
                                <div class="h5 mb-0 font-weight-bold text-gray-800" v-else>
                                    <span class="spinner-border spinner-border-sm" role="status"
                                        aria-hidden="true"></span>
                                </div>
                            </div>
                            <div class="col-auto">
                                <i class="fas fa-shopping-cart fa-2x text-gray-300"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Thống kê sản phẩm -->
            <div class="col-xl-3 col-md-6 mb-4">
                <div class="card border-left-success shadow h-100 py-2">
                    <div class="card-body">
                        <div class="row no-gutters align-items-center">
                            <div class="col mr-2">
                                <div class="text-xs font-weight-bold text-success text-uppercase mb-1">
                                    Total Products</div>
                                <div class="h5 mb-0 font-weight-bold text-gray-800" v-if="!loading.stats">
                                    {{ stats.totalProducts }}
                                </div>
                                <div class="h5 mb-0 font-weight-bold text-gray-800" v-else>
                                    <span class="spinner-border spinner-border-sm" role="status"
                                        aria-hidden="true"></span>
                                </div>
                            </div>
                            <div class="col-auto">
                                <i class="fas fa-box fa-2x text-gray-300"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Thống kê người dùng -->
            <div class="col-xl-3 col-md-6 mb-4">
                <div class="card border-left-info shadow h-100 py-2">
                    <div class="card-body">
                        <div class="row no-gutters align-items-center">
                            <div class="col mr-2">
                                <div class="text-xs font-weight-bold text-info text-uppercase mb-1">
                                    Total Users</div>
                                <div class="h5 mb-0 font-weight-bold text-gray-800" v-if="!loading.stats">
                                    {{ stats.totalUsers }}
                                </div>
                                <div class="h5 mb-0 font-weight-bold text-gray-800" v-else>
                                    <span class="spinner-border spinner-border-sm" role="status"
                                        aria-hidden="true"></span>
                                </div>
                            </div>
                            <div class="col-auto">
                                <i class="fas fa-users fa-2x text-gray-300"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Thống kê doanh thu -->
            <div class="col-xl-3 col-md-6 mb-4">
                <div class="card border-left-warning shadow h-100 py-2">
                    <div class="card-body">
                        <div class="row no-gutters align-items-center">
                            <div class="col mr-2">
                                <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">
                                    Total Revenue</div>
                                <div class="h5 mb-0 font-weight-bold text-gray-800" v-if="!loading.stats">
                                    {{ totalRevenue }}
                                </div>
                                <div class="h5 mb-0 font-weight-bold text-gray-800" v-else>
                                    <span class="spinner-border spinner-border-sm" role="status"
                                        aria-hidden="true"></span>
                                </div>
                            </div>
                            <div class="col-auto">
                                <i class="fas fa-dollar-sign fa-2x text-gray-300"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Biểu đồ doanh thu và Danh sách -->
        <div class="row">
            <!-- Biểu đồ doanh thu -->
            <div class="col-lg-8 mb-4">
                <div class="card shadow mb-4">
                    <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                        <h6 class="m-0 font-weight-bold text-primary">Revenue Overview</h6>
                        <div class="dropdown no-arrow">
                            <div class="btn-group">
                                <select class="form-select form-select-sm me-2" v-model="selectedPeriod"
                                    @change="handlePeriodChange">
                                    <option value="year">Yearly</option>
                                    <option value="month">Monthly</option>
                                </select>
                                <select class="form-select form-select-sm me-2" v-model="selectedYear"
                                    @change="loadRevenueData">
                                    <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
                                </select>
                                <select class="form-select form-select-sm" v-if="selectedPeriod === 'month'"
                                    v-model="selectedMonth" @change="loadRevenueData">
                                    <option value="1">January</option>
                                    <option value="2">February</option>
                                    <option value="3">March</option>
                                    <option value="4">April</option>
                                    <option value="5">May</option>
                                    <option value="6">June</option>
                                    <option value="7">July</option>
                                    <option value="8">August</option>
                                    <option value="9">September</option>
                                    <option value="10">October</option>
                                    <option value="11">November</option>
                                    <option value="12">December</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="chart-container" style="position: relative; height:300px;">
                            <canvas ref="revenueChartRef"></canvas>
                            <div class="d-flex justify-content-center align-items-center"
                                style="position: absolute; top: 0; left: 0; right: 0; bottom: 0;"
                                v-if="loading.revenue">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Top Products -->
            <div class="col-lg-4 mb-4">
                <div class="card shadow mb-4">
                    <div class="card-header py-3">
                        <h6 class="m-0 font-weight-bold text-primary">Top Products</h6>
                    </div>
                    <div class="card-body">
                        <div class="d-flex justify-content-center" v-if="loading.products">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </div>
                        <ul class="list-group" v-else>
                            <li class="list-group-item d-flex justify-content-between align-items-center"
                                v-for="product in topProducts" :key="product.id">
                                <div>
                                    <div class="fw-bold">{{ product.productName }}</div>
                                    <small class="text-muted">{{ formatCurrency(product.revenue) }}</small>
                                </div>
                                <span class="badge bg-primary rounded-pill">{{ product.quantity }}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <!-- Recent Orders -->
        <div class="row">
            <div class="col-12">
                <div class="card shadow mb-4">
                    <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                        <h6 class="m-0 font-weight-bold text-primary">Recent Orders</h6>
                        <div class="dropdown no-arrow">
                            <div class="btn-group">
                                <button type="button" class="btn btn-sm"
                                    :class="recentOrdersPeriod === 'day' ? 'btn-primary' : 'btn-outline-secondary'"
                                    @click="recentOrdersPeriod = 'day'">
                                    <i class="fas fa-calendar-day me-1"></i> Day
                                </button>
                                <button type="button" class="btn btn-sm"
                                    :class="recentOrdersPeriod === 'week' ? 'btn-primary' : 'btn-outline-secondary'"
                                    @click="recentOrdersPeriod = 'week'">
                                    <i class="fas fa-calendar-week me-1"></i> Week
                                </button>
                                <button type="button" class="btn btn-sm"
                                    :class="recentOrdersPeriod === 'month' ? 'btn-primary' : 'btn-outline-secondary'"
                                    @click="recentOrdersPeriod = 'month'">
                                    <i class="fas fa-calendar-alt me-1"></i> Month
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="d-flex justify-content-center" v-if="loading.orders">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </div>
                        <div class="table-responsive" v-else>
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Amount</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-if="filteredRecentOrders.length === 0">
                                        <td colspan="6" class="text-center text-muted">No orders found for this period.
                                        </td>
                                    </tr>
                                    <tr v-else v-for="order in filteredRecentOrders" :key="order.id">
                                        <td>#{{ order.id }}</td>
                                        <td>{{ order.customerName }}</td>
                                        <td>{{ formatDate(order.createdAt) }}</td>
                                        <td>
                                            <span :class="'badge ' + getStatusBadge(order.status)">
                                                {{ formatStatus(order.status) }}
                                            </span>
                                        </td>
                                        <td>{{ formatCurrency(order.total) }}</td>
                                        <td>
                                            <button class="btn btn-sm btn-info text-white"
                                                @click="goToOrderDetail(order.id)">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.card {
    border-radius: 0.5rem;
    overflow: hidden;
}

.card-header {
    background-color: #f8f9fc;
    border-bottom: 1px solid #e3e6f0;
}

.border-left-primary,
.border-left-success,
.border-left-info,
.border-left-warning {
    border-left: 0.25rem solid;
}

.border-left-primary {
    border-left-color: #4e73df;
}

.border-left-success {
    border-left-color: #1cc88a;
}

.border-left-info {
    border-left-color: #36b9cc;
}

.border-left-warning {
    border-left-color: #f6c23e;
}

.text-gray-300 {
    color: #dddfeb !important;
}

.text-gray-800 {
    color: #5a5c69 !important;
}

.chart-container {
    position: relative;
    margin: auto;
}

.list-group-item:hover {
    background-color: #f8f9fc;
}

.table {
    margin-bottom: 0;
}

.table td,
.table th {
    vertical-align: middle;
}

.btn-group .btn-primary {
    color: #fff;
    background-color: #4e73df;
    border-color: #4e73df;
}

.btn-group .btn-outline-secondary {
    color: #858796;
    border-color: #d1d3e2;
}

.btn-group .btn-outline-secondary:hover {
    background-color: #f8f9fc;
}
</style>