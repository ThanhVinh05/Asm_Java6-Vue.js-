<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import { tokenService } from "../../utils/tokenService";
import { updateOrderStatus, getUserByOrder } from "../../api/order";
import Swal from "sweetalert2";

const route = useRoute();
const orderId = route.params.id;
const orderDetails = ref([]);
const orderData = ref(null);
const loading = ref(true);
const processingAction = ref(false);
const userInfo = ref(null);

const fetchOrderDetails = async () => {
    try {
        loading.value = true;
        console.log("Fetching order details for ID:", orderId);
        const token = tokenService.getToken();

        // Lấy chi tiết đơn hàng (orderDetails)
        try {
            const response = await axios.get(`http://localhost:8080/order/details/${orderId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            console.log("Order details API response:", response);

            if (response.data && response.data.status === 200) {
                const detailsData = response.data.data;
                console.log("Order details data:", detailsData);

                // Kiểm tra và xử lý dữ liệu chi tiết đơn hàng
                if (Array.isArray(detailsData)) {
                    orderDetails.value = detailsData;
                } else {
                    // Nếu không phải mảng, có thể là đối tượng đơn
                    orderDetails.value = [detailsData];
                }
            } else {
                console.error("Invalid order details response:", response);
                orderDetails.value = [];
            }
        } catch (detailsError) {
            console.error("Error fetching order details:", detailsError);
            orderDetails.value = [];
        }

        // Lấy thông tin cơ bản đơn hàng (orderData)
        try {
            const orderResponse = await axios.get(`http://localhost:8080/order/${orderId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            console.log("Order data API response:", orderResponse);

            if (orderResponse.data && orderResponse.data.status === 200) {
                orderData.value = orderResponse.data.data;
                console.log("Order data:", orderData.value);

                // Fetch user information for the order
                await fetchUserByOrder();
            } else {
                console.error("Invalid order data response:", orderResponse);
                orderData.value = null;
            }
        } catch (orderError) {
            console.error("Error fetching order data:", orderError);
            orderData.value = null;
        }

        if (!orderDetails.value.length && !orderData.value) {
            throw new Error("Không thể tải thông tin đơn hàng");
        }
    } catch (error) {
        console.error("Error in fetchOrderDetails:", error);
        Swal.fire({
            icon: "error",
            title: "Lỗi",
            text: "Không thể tải thông tin chi tiết đơn hàng"
        });
    } finally {
        loading.value = false;
        console.log("Final orderDetails:", orderDetails.value);
        console.log("Final orderData:", orderData.value);
    }
};

const fetchUserByOrder = async () => {
    try {
        console.log("Fetching user information for order ID:", orderId);
        const response = await getUserByOrder(orderId);

        if (response && response.status === 200) {
            userInfo.value = response.data;
            console.log("User info for order:", userInfo.value);
        } else {
            console.error("Invalid user info response:", response);
            userInfo.value = null;
        }
    } catch (error) {
        console.error("Error fetching user info for order:", error);
        userInfo.value = null;
    }
};

const handleUpdateStatus = async (newStatus) => {
    try {
        processingAction.value = true;

        const result = await Swal.fire({
            title: 'Xác nhận thay đổi trạng thái',
            text: `Bạn có chắc muốn chuyển đơn hàng sang trạng thái "${getStatusText(newStatus)}"?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Xác nhận',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            console.log(`Updating order ${orderId} status to ${newStatus}`);
            const response = await updateOrderStatus(orderId, newStatus);

            console.log("Update status response:", response);

            if (response && response.status === 200) {
                // Update local state
                orderData.value.status = newStatus;

                await Swal.fire({
                    icon: 'success',
                    title: 'Cập nhật thành công',
                    text: `Đơn hàng đã được chuyển sang trạng thái "${getStatusText(newStatus)}"`,
                    timer: 1500
                });
            } else {
                throw new Error("Cập nhật trạng thái không thành công");
            }
        }
    } catch (error) {
        console.error("Error updating order status:", error);
        Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: error.message || 'Không thể cập nhật trạng thái đơn hàng'
        });
    } finally {
        processingAction.value = false;
    }
};

const getStatusClass = (status) => {
    switch (status) {
        case "PENDING": return "bg-warning";
        case "CONFIRMED": return "bg-info";
        case "SHIPPING": return "bg-primary";
        case "COMPLETED": return "bg-success";
        case "CANCELLED": return "bg-danger";
        default: return "bg-secondary";
    }
};

const getStatusText = (status) => {
    switch (status) {
        case "PENDING": return "Chờ xác nhận";
        case "CONFIRMED": return "Đã xác nhận";
        case "SHIPPING": return "Đang giao hàng";
        case "COMPLETED": return "Hoàn thành";
        case "CANCELLED": return "Đã hủy";
        default: return status;
    }
};

const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
        case "PENDING": return "CONFIRMED";
        case "CONFIRMED": return "SHIPPING";
        default: return null;
    }
};

const getActionButtonText = (status) => {
    switch (status) {
        case "PENDING": return "Xác nhận";
        case "CONFIRMED": return "Giao hàng";
        case "SHIPPING": return "Đang giao hàng";
        default: return "";
    }
};

const formatProductName = (product) => {
    if (!product) return "Sản phẩm không có sẵn";
    return product.name || product.productName;
};

const getProductImage = (product) => {
    if (!product) return null;
    if (product.image) {
        try {
            const images = JSON.parse(product.image);
            return images && images.length > 0 ? `/src/assets/img/${images[0]}` : null;
        } catch (error) {
            return product.image;
        }
    }
    return null;
};

const formatAddress = (address) => {
    if (!address) return "Không có thông tin";

    const parts = [
        address.streetNumber,
        address.commune,
        address.district,
        address.city,
        address.country || 'Việt Nam'
    ].filter(Boolean);

    return parts.join(', ');
};

onMounted(() => {
    fetchOrderDetails();
});
</script>

<template>
    <div class="container-fluid p-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>Chi tiết đơn hàng #{{ orderId }}</h2>
            <button class="btn btn-outline-primary" @click="$router.back()">
                <i class="fas fa-arrow-left me-2"></i>Quay lại
            </button>
        </div>

        <div v-if="loading" class="text-center my-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Đang tải thông tin đơn hàng...</p>
        </div>

        <div v-else-if="orderDetails.length > 0" class="row">
            <!-- Thông tin đơn hàng -->
            <div class="col-md-8">
                <div class="card shadow-sm mb-4">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0">Thông tin đơn hàng</h5>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Sản phẩm</th>
                                        <th>Giá</th>
                                        <th>Số lượng</th>
                                        <th>Tổng tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item in orderDetails" :key="item.id">
                                        <td>
                                            <div class="d-flex align-items-center">
                                                <img :src="getProductImage(item.product)" alt="Product image"
                                                    class="product-thumbnail me-2" v-if="getProductImage(item.product)">
                                                <div>
                                                    <div class="fw-bold">{{ formatProductName(item.product) }}</div>
                                                    <small class="text-muted" v-if="item.product?.sku">
                                                        SKU: {{ item.product?.sku }}
                                                    </small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{{ new Intl.NumberFormat("vi-VN", {
                                            style: "currency", currency: "VND"
                                        }).format(item.price) }}</td>
                                        <td>{{ item.quantity }}</td>
                                        <td>{{ new Intl.NumberFormat("vi-VN", {
                                            style: "currency", currency: "VND"
                                        }).format(item.price * item.quantity) }}</td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colspan="3" class="text-end fw-bold">Tổng cộng:</td>
                                        <td class="fw-bold">
                                            {{ new Intl.NumberFormat("vi-VN", {
                                                style: "currency", currency: "VND"
                                            }).format(orderData?.totalAmount || 0) }}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Thông tin trạng thái và khách hàng -->
            <div class="col-md-4">
                <!-- Thông tin khách hàng -->
                <div class="card shadow-sm mb-4">
                    <div class="card-header bg-success text-white">
                        <h5 class="mb-0">Thông tin khách hàng</h5>
                    </div>
                    <div class="card-body">
                        <div v-if="userInfo">
                            <div class="mb-3">
                                <strong>Tên khách hàng:</strong>
                                <p>{{ userInfo.username }}</p>
                            </div>
                            <div class="mb-3">
                                <strong>Email:</strong>
                                <p>{{ userInfo.email }}</p>
                            </div>
                            <div class="mb-3">
                                <strong>Số điện thoại:</strong>
                                <p>{{ userInfo.phone || "Không có thông tin" }}</p>
                            </div>

                            <!-- Địa chỉ giao hàng -->
                            <div class="mb-3">
                                <strong>Địa chỉ giao hàng:</strong>
                                <p v-if="userInfo.addresses && userInfo.addresses.length > 0">
                                    {{formatAddress(userInfo.addresses.find(a => a.addressType === 1) ||
                                        userInfo.addresses[0])}}
                                </p>
                                <p v-else>Không có thông tin địa chỉ</p>
                            </div>
                        </div>
                        <div v-else>
                            <p class="text-center text-muted">Đang tải thông tin khách hàng...</p>
                        </div>
                    </div>
                </div>

                <!-- Thông tin trạng thái đơn hàng -->
                <div class="card shadow-sm mb-4">
                    <div class="card-header bg-info text-white">
                        <h5 class="mb-0">Trạng thái đơn hàng</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <span v-if="orderData" class="badge" :class="getStatusClass(orderData.status)">
                                {{ getStatusText(orderData.status) }}
                            </span>
                            <span v-else-if="orderDetails[0]?.order?.status" class="badge"
                                :class="getStatusClass(orderDetails[0].order.status)">
                                {{ getStatusText(orderDetails[0].order.status) }}
                            </span>
                        </div>
                        <div class="mb-3">
                            <strong>Ngày đặt hàng:</strong>
                            <p v-if="orderData?.createdAt">
                                {{ new Date(orderData.createdAt).toLocaleString() }}
                            </p>
                            <p v-else-if="orderDetails[0]?.order?.createdAt">
                                {{ new Date(orderDetails[0].order.createdAt).toLocaleString() }}
                            </p>
                            <p v-else>Không có thông tin</p>
                        </div>
                        <div class="mb-3">
                            <strong>Phương thức thanh toán:</strong>
                            <p>{{ orderData?.paymentMethod || orderDetails[0]?.order?.paymentMethod
                                || "Không có thông tin" }}</p>
                        </div>
                        <div class="mb-3">
                            <strong>Ghi chú:</strong>
                            <p>{{ orderData?.note || orderDetails[0]?.order?.note || "Không có ghi chú" }}</p>
                        </div>

                        <!-- Action buttons based on order status -->
                        <div class="mb-3" v-if="orderData">
                            <button v-if="orderData.status !== 'CANCELLED' &&
                                orderData.status !== 'COMPLETED' &&
                                orderData.status !== 'SHIPPING'" class="btn btn-success w-100"
                                :disabled="processingAction"
                                @click="handleUpdateStatus(getNextStatus(orderData.status))">
                                <span v-if="processingAction" class="spinner-border spinner-border-sm me-2"
                                    role="status"></span>
                                {{ getActionButtonText(orderData.status) }}
                            </button>

                            <button v-else-if="orderData.status === 'SHIPPING'" class="btn btn-primary w-100" disabled>
                                Đang giao hàng
                            </button>
                        </div>
                    </div>
                </div>


            </div>
        </div>

        <div v-else class="alert alert-warning">
            Không tìm thấy thông tin đơn hàng
        </div>
    </div>
</template>

<style scoped>
.product-thumbnail {
    width: 50px;
    height: 50px;
    object-fit: cover;
    border-radius: 4px;
}

.badge {
    font-size: 0.9rem;
    padding: 0.5rem 1rem;
}
</style>