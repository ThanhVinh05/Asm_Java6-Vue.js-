<template>
    <div class="card shadow-sm h-100">
        <div class="card-header bg-white">
            <div class="d-flex justify-content-between align-items-center">
                <h5 class="card-title mb-0">{{ title }}</h5>
                <div class="btn-group">
                    <button v-for="period in periods" :key="period.value" class="btn btn-sm"
                        :class="selectedPeriod === period.value ? 'btn-primary' : 'btn-outline-primary'"
                        @click="changePeriod(period.value)">
                        {{ period.label }}
                    </button>
                </div>
            </div>
        </div>
        <div class="card-body">
            <div v-if="loading" class="d-flex justify-content-center align-items-center h-100">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
            <div v-else-if="error" class="alert alert-danger">
                {{ error }}
            </div>
            <div v-else>
                <canvas ref="chartCanvas" height="250"></canvas>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';
import Chart from 'chart.js/auto';

const props = defineProps({
    title: {
        type: String,
        default: 'Thống kê đơn hàng'
    },
    orderData: {
        type: Array,
        required: true
    },
    type: {
        type: String,
        default: 'line',
        validator: (value) => ['line', 'bar', 'pie', 'doughnut'].includes(value)
    }
});

// Chart state
const chartCanvas = ref(null);
const chartInstance = ref(null);
const loading = ref(true);
const error = ref(null);
const selectedPeriod = ref('week');

// Time period options
const periods = [
    { value: 'week', label: '7 ngày' },
    { value: 'month', label: '30 ngày' },
    { value: 'year', label: '12 tháng' }
];

// Helper functions
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit'
    });
};

const formatMonth = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
        month: 'short'
    });
};

const getDateRange = (period) => {
    const today = new Date();
    const endDate = new Date(today);

    let startDate;
    let format;
    let groupByFunction;

    switch (period) {
        case 'week':
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 6);
            format = formatDate;
            groupByFunction = (date) => formatDate(date);
            break;
        case 'month':
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 29);
            format = formatDate;
            groupByFunction = (date) => formatDate(date);
            break;
        case 'year':
            startDate = new Date(today);
            startDate.setMonth(today.getMonth() - 11);
            startDate.setDate(1);
            format = formatMonth;
            groupByFunction = (date) => {
                const d = new Date(date);
                return `${d.getMonth() + 1}/${d.getFullYear()}`;
            };
            break;
        default:
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 6);
            format = formatDate;
            groupByFunction = (date) => formatDate(date);
    }

    return { startDate, endDate, format, groupByFunction };
};

const processChartData = (period) => {
    try {
        loading.value = true;
        error.value = null;

        if (!props.orderData || props.orderData.length === 0) {
            error.value = 'Không có dữ liệu để hiển thị';
            return { labels: [], datasets: [] };
        }

        const { startDate, endDate, format, groupByFunction } = getDateRange(period);

        // Filter orders by date range
        const filteredOrders = props.orderData.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= startDate && orderDate <= endDate;
        });

        // Group orders by date
        const groupedData = {};

        // Initialize all dates in the range
        let currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            const key = groupByFunction(currentDate);
            groupedData[key] = {
                total: 0,
                count: 0,
                cancelled: 0,
                completed: 0
            };

            if (period === 'year') {
                currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
            } else {
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }

        // Fill with actual data
        filteredOrders.forEach(order => {
            const key = groupByFunction(order.createdAt);

            if (groupedData[key]) {
                groupedData[key].total += order.totalAmount;
                groupedData[key].count += 1;

                if (order.status === 'CANCELLED') {
                    groupedData[key].cancelled += 1;
                }

                if (order.status === 'COMPLETED') {
                    groupedData[key].completed += 1;
                }
            }
        });

        // Convert grouped data to chart format
        const labels = Object.keys(groupedData);

        // Sort labels by date if needed
        if (period === 'week' || period === 'month') {
            labels.sort((a, b) => {
                const [dayA, monthA] = a.split('/');
                const [dayB, monthB] = b.split('/');
                const dateA = new Date(2023, parseInt(monthA) - 1, parseInt(dayA));
                const dateB = new Date(2023, parseInt(monthB) - 1, parseInt(dayB));
                return dateA - dateB;
            });
        }

        const orderCounts = labels.map(label => groupedData[label].count);
        const orderAmounts = labels.map(label => groupedData[label].total);
        const cancelledOrders = labels.map(label => groupedData[label].cancelled);
        const completedOrders = labels.map(label => groupedData[label].completed);

        // Build datasets based on chart type
        let datasets = [];

        if (props.type === 'line' || props.type === 'bar') {
            datasets = [
                {
                    label: 'Số đơn hàng',
                    data: orderCounts,
                    borderColor: '#0d6efd',
                    backgroundColor: 'rgba(13, 110, 253, 0.1)',
                    borderWidth: 2,
                    tension: 0.2
                },
                {
                    label: 'Hoàn thành',
                    data: completedOrders,
                    borderColor: '#198754',
                    backgroundColor: 'rgba(25, 135, 84, 0.1)',
                    borderWidth: 2,
                    tension: 0.2
                },
                {
                    label: 'Đã hủy',
                    data: cancelledOrders,
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    borderWidth: 2,
                    tension: 0.2
                }
            ];
        } else if (props.type === 'pie' || props.type === 'doughnut') {
            const totalOrderCount = orderCounts.reduce((acc, count) => acc + count, 0);
            const totalCompleted = completedOrders.reduce((acc, count) => acc + count, 0);
            const totalCancelled = cancelledOrders.reduce((acc, count) => acc + count, 0);
            const totalPending = totalOrderCount - totalCompleted - totalCancelled;

            datasets = [
                {
                    data: [totalCompleted, totalCancelled, totalPending],
                    backgroundColor: [
                        'rgba(25, 135, 84, 0.7)',
                        'rgba(220, 53, 69, 0.7)',
                        'rgba(255, 193, 7, 0.7)'
                    ],
                    borderWidth: 1
                }
            ];

            return {
                labels: ['Hoàn thành', 'Đã hủy', 'Đang xử lý'],
                datasets
            };
        }

        return { labels, datasets };
    } catch (err) {
        console.error('Error processing chart data:', err);
        error.value = 'Lỗi xử lý dữ liệu biểu đồ';
        return { labels: [], datasets: [] };
    } finally {
        loading.value = false;
    }
};

// Chart rendering
const renderChart = () => {
    if (chartInstance.value) {
        chartInstance.value.destroy();
    }

    if (!chartCanvas.value) return;

    const ctx = chartCanvas.value.getContext('2d');
    const { labels, datasets } = processChartData(selectedPeriod.value);

    const config = {
        type: props.type,
        data: {
            labels,
            datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: props.type === 'pie' || props.type === 'doughnut' ? undefined : {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    };

    chartInstance.value = new Chart(ctx, config);
};

const changePeriod = (period) => {
    selectedPeriod.value = period;
};

// Watchers
watch(() => props.orderData, renderChart, { deep: true });
watch(() => selectedPeriod.value, renderChart);

// Lifecycle hooks
onMounted(() => {
    renderChart();
});

onBeforeUnmount(() => {
    if (chartInstance.value) {
        chartInstance.value.destroy();
    }
});
</script>

<style scoped>
.card {
    transition: all 0.2s ease;
}

.btn-group .btn {
    font-size: 0.8rem;
}
</style>