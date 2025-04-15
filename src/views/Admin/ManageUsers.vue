<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { getUserOrders } from '../../api/user';
import { getOrdersByUserId } from '../../api/order';
import { tokenService } from '../../utils/tokenService';
import Swal from 'sweetalert2';
import axios from 'axios';

const router = useRouter();
const store = useStore();
const users = ref([]);
const loading = ref(true);
const searchKeyword = ref('');
const sortBy = ref('id:asc');
const currentPage = ref(1);
const totalPages = ref(0);
const pageSize = ref(10);
const totalElements = ref(0);

// Thông tin cho modal
const showUserModal = ref(false);
const selectedUser = ref(null);
const userOrders = ref([]);
const loadingOrders = ref(false);

// Kiểm tra quyền admin
const isAdmin = computed(() => store.getters['auth/isAdmin']);

// Lấy danh sách người dùng
const fetchUsers = async (page = 1) => {
    try {
        loading.value = true;

        // Kiểm tra quyền admin
        if (!isAdmin.value) {
            Swal.fire({
                icon: 'error',
                title: 'Không có quyền',
                text: 'Bạn không có quyền truy cập trang này',
                showConfirmButton: true
            });
            setTimeout(() => router.push('/'), 2000);
            return;
        }

        const params = {
            page: page,
            size: pageSize.value,
            keyword: searchKeyword.value || null,
            sort: sortBy.value || null
        };

        console.log('Fetching users with params:', params);
        console.log('Token used:', tokenService.getToken());

        try {
            // Tạo URL trực tiếp để debug
            const url = `http://localhost:8080/user/list?page=${params.page}&size=${params.size}`;
            console.log('Direct URL for debugging:', url);

            // Gọi API trực tiếp với axios để debug
            const directResponse = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${tokenService.getToken()}`
                }
            });
            console.log('Direct API response:', directResponse);
        } catch (directError) {
            console.error('Direct API call error:', directError);
            console.error('Direct response data if any:', directError.response?.data);
        }

        // Gọi API thông qua store
        const response = await store.dispatch('users/fetchAllUsers', params);

        if (response) {
            users.value = response.data || [];
            totalPages.value = response.totalPages || 0;
            totalElements.value = response.totalElements || 0;
            currentPage.value = page;
            console.log('Final users array:', users.value);
        } else {
            users.value = [];
            totalPages.value = 0;
            console.log('No response data received from API');
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        console.error('Error response:', error.response);
        console.error('Error details:', error.message);
        Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: error.message || 'Không thể tải danh sách người dùng. Vui lòng thử lại sau.',
            showConfirmButton: true
        });
    } finally {
        loading.value = false;
    }
};

// Lấy đơn hàng của người dùng
const fetchUserOrders = async (userId) => {
    try {
        loadingOrders.value = true;
        console.log('Fetching orders for user ID:', userId);

        const response = await getOrdersByUserId(userId);
        console.log('Orders API Response:', response);

        if (response && response.content) {
            userOrders.value = response.content;
        } else if (Array.isArray(response)) {
            userOrders.value = response;
        } else {
            userOrders.value = [];
        }

        console.log('Processed orders:', userOrders.value);
    } catch (error) {
        console.error(`Error fetching orders for user ${userId}:`, error);
        Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: 'Không thể tải danh sách đơn hàng của người dùng'
        });
        userOrders.value = [];
    } finally {
        loadingOrders.value = false;
    }
};

// Xem chi tiết người dùng
const viewUserDetail = async (userId) => {
    try {
        loading.value = true;
        console.log("Fetching user details for ID:", userId);

        // Lấy thông tin chi tiết người dùng
        const token = tokenService.getToken();
        const response = await axios.get(`http://localhost:8080/user/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log("User details API response:", response);

        if (response.data && response.data.status === 200) {
            selectedUser.value = response.data.data;

            // Hiển thị modal trước khi lấy đơn hàng
            showUserModal.value = true;

            // Lấy danh sách đơn hàng của người dùng
            await fetchUserOrders(userId);
        } else {
            throw new Error("Không thể lấy thông tin chi tiết người dùng");
        }
    } catch (error) {
        console.error(`Error fetching user details for ID ${userId}:`, error);
        Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: error.message || 'Không thể tải thông tin chi tiết người dùng. Vui lòng thử lại sau.',
            showConfirmButton: true
        });
    } finally {
        loading.value = false;
    }
};

// Đóng modal
const closeUserModal = () => {
    showUserModal.value = false;
    selectedUser.value = null;
    userOrders.value = [];
};

// Thay đổi vai trò người dùng
const changeUserRole = async (user) => {
    try {
        // Kiểm tra xem người dùng đã là Admin chưa
        if (user.role === 'ADMIN' || user.type === 'ADMIN') {
            Swal.fire({
                icon: 'warning',
                title: 'Không thể thay đổi',
                text: 'Bạn không thể thay đổi role Admin',
                confirmButtonText: 'Đóng'
            });
            return;
        }

        // Xác nhận trước khi thay đổi
        const result = await Swal.fire({
            title: 'Xác nhận thay đổi vai trò',
            text: `Bạn có chắc muốn thay đổi vai trò của ${user.username} từ User thành Admin?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Hủy'
        });

        // Nếu người dùng đồng ý
        if (result.isConfirmed) {
            console.log('Changing role for user ID:', user.id);

            // Gọi action để cập nhật vai trò
            await store.dispatch('users/updateUserRole', {
                userId: user.id,
                role: 'ADMIN'
            });

            // Hiển thị thông báo thành công
            await Swal.fire({
                icon: 'success',
                title: 'Thành công',
                text: 'Đã cập nhật vai trò người dùng thành Admin',
                timer: 1500,
                showConfirmButton: false
            });

            // Tải lại toàn bộ danh sách người dùng từ server
            await fetchUsers(currentPage.value);
        }
    } catch (error) {
        console.error('Error changing user role:', error);
        Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: error.message || 'Không thể cập nhật vai trò người dùng. Vui lòng thử lại sau.'
        });
    }
};

// Thay đổi trạng thái người dùng
const toggleUserStatus = async (user) => {
    try {
        // Xác nhận thay đổi trạng thái
        const { isConfirmed } = await Swal.fire({
            title: 'Xác nhận thay đổi trạng thái?',
            text: `Bạn có chắc chắn muốn ${user.status === 'ACTIVE' ? 'vô hiệu hóa' : 'kích hoạt'} người dùng này?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Xác nhận',
            cancelButtonText: 'Hủy'
        });

        if (isConfirmed) {
            const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

            await store.dispatch('users/updateUserStatus', {
                userId: user.id,
                status: newStatus
            });

            Swal.fire({
                icon: 'success',
                title: 'Thành công',
                text: `Đã ${newStatus === 'ACTIVE' ? 'kích hoạt' : 'vô hiệu hóa'} người dùng`,
                timer: 1500
            });

            // Tải lại danh sách người dùng
            await fetchUsers();
        }
    } catch (error) {
        console.error(`Error toggling status for user ID ${user.id}:`, error);
        Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: error.message || 'Không thể thay đổi trạng thái người dùng. Vui lòng thử lại sau.',
            showConfirmButton: true
        });
    }
};

// Xóa người dùng
const confirmDeleteUser = async (userId) => {
    try {
        // Xác nhận xóa người dùng
        const { isConfirmed } = await Swal.fire({
            title: 'Xác nhận xóa?',
            text: 'Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy'
        });

        if (isConfirmed) {
            await store.dispatch('users/deleteUser', userId);

            Swal.fire({
                icon: 'success',
                title: 'Đã xóa!',
                text: 'Người dùng đã được xóa thành công',
                timer: 1500
            });

            // Tải lại danh sách người dùng
            await fetchUsers();
        }
    } catch (error) {
        console.error(`Error deleting user ID ${userId}:`, error);
        Swal.fire({
            icon: 'error',
            title: 'Lỗi!',
            text: error.message || 'Không thể xóa người dùng. Vui lòng thử lại sau.'
        });
    }
};

// Hàm tìm kiếm người dùng
const searchUsers = () => {
    fetchUsers(1);
};

// Hàm thay đổi trang
const changePage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        fetchUsers(page);
    }
};

// Hàm chuyển đến trang chi tiết đơn hàng
const goToOrderDetail = (orderId) => {
    if (!orderId) {
        Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: 'Không tìm thấy mã đơn hàng',
            timer: 1500
        });
        return;
    }

    console.log('Navigating to order detail:', orderId);
    router.push(`/admin/orders/${orderId}`);
    closeUserModal();
};

// Xem chi tiết đơn hàng trong modal
const viewOrderDetail = (order) => {
    Swal.fire({
        title: `Chi tiết đơn hàng #${order.id}`,
        html: `
            <div class="text-start">
                <p><strong>Ngày đặt:</strong> ${new Date(order.orderDate).toLocaleString()}</p>
                <p><strong>Trạng thái:</strong> ${order.status}</p>
                <p><strong>Tổng tiền:</strong> ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}</p>
                <hr>
                <h6>Sản phẩm:</h6>
                <ul class="list-group">
                    ${order.orderItems?.map(item => `
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            ${item.productName} 
                            <span class="badge bg-primary rounded-pill">${item.quantity} x ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}</span>
                        </li>
                    `).join('') || 'Không có sản phẩm'}
                </ul>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Xem đầy đủ',
        cancelButtonText: 'Đóng',
        customClass: {
            container: 'swal-wide',
            popup: 'swal-wide'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            goToOrderDetail(order.id);
        }
    });
};

// Format địa chỉ thành chuỗi
const formatAddress = (address) => {
    if (!address) return 'Chưa có địa chỉ';

    const parts = [
        address.streetNumber,
        address.commune,
        address.district,
        address.city,
        address.country
    ].filter(Boolean);

    return parts.join(', ');
};

// Lắng nghe thay đổi
watch([searchKeyword, sortBy], () => {
    searchUsers();
});

// Kiểm tra token và quyền admin khi vào trang
onMounted(async () => {
    console.log("ManageUsers component mounted");

    // Kiểm tra token và quyền admin
    const token = tokenService.getToken();
    console.log("Auth check - Token exists:", !!token);
    console.log("Auth check - Is admin:", isAdmin.value);

    if (!token) {
        Swal.fire({
            icon: 'error',
            title: 'Chưa đăng nhập',
            text: 'Bạn cần đăng nhập để truy cập trang này',
            showConfirmButton: true
        });
        setTimeout(() => {
            router.push('/login');
        }, 2000);
        return;
    }

    if (!isAdmin.value) {
        Swal.fire({
            icon: 'error',
            title: 'Không có quyền',
            text: 'Bạn không có quyền truy cập trang này',
            showConfirmButton: true
        });
        setTimeout(() => {
            router.push('/');
        }, 2000);
        return;
    }

    console.log("Before calling fetchUsers");

    // Phương pháp 1: Gọi trực tiếp từ API (debugging)
    try {
        const token = tokenService.getToken();
        const response = await axios.get(`http://localhost:8080/user/list?page=1&size=10`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log("Direct API call result:", response.data);

        if (response.data && response.data.data && response.data.data.users) {
            users.value = response.data.data.users;
            totalPages.value = response.data.data.totalPages || 0;
            console.log("Users loaded directly:", users.value);
        }
    } catch (err) {
        console.error("Direct API call error:", err);
    }

    // Phương pháp 2: Gọi qua store (cách chính)
    await fetchUsers();

    console.log("After calling fetchUsers");
});

// Làm mới danh sách đơn hàng của người dùng
const refreshUserOrders = async (userId) => {
    if (!userId) return;

    try {
        // Hiển thị thông báo đang làm mới
        Swal.fire({
            title: 'Đang làm mới...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Gọi lại API lấy đơn hàng
        await fetchUserOrders(userId);

        // Đóng thông báo
        Swal.close();

        // Hiển thị thông báo thành công
        Swal.fire({
            icon: 'success',
            title: 'Đã làm mới',
            text: 'Danh sách đơn hàng đã được cập nhật',
            timer: 1500,
            showConfirmButton: false
        });
    } catch (error) {
        console.error('Error refreshing user orders:', error);
        Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: 'Không thể làm mới danh sách đơn hàng',
            timer: 1500
        });
    }
};
</script>

<template>
    <div
        class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 class="h2">Quản Lý Người Dùng</h1>
        <div class="btn-toolbar mb-2 mb-md-0">
            <div class="input-group">
                <input type="text" class="form-control" placeholder="Tìm kiếm người dùng..." v-model="searchKeyword"
                    @keyup.enter="searchUsers">
                <button class="btn btn-outline-secondary" type="button" @click="searchUsers">
                    <i class="fas fa-search"></i>
                </button>
            </div>
        </div>
    </div>

    <!-- Bảng danh sách người dùng -->
    <div class="card shadow-sm">
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tên người dùng</th>
                            <th>Email</th>
                            <th>Vai trò</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="loading">
                            <td colspan="6" class="text-center">
                                <div class="spinner-border" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                            </td>
                        </tr>
                        <tr v-else-if="users.length === 0">
                            <td colspan="6" class="text-center">
                                Không tìm thấy người dùng nào.
                            </td>
                        </tr>
                        <tr v-else v-for="user in users" :key="user.id">
                            <td>{{ user.id }}</td>
                            <td>{{ user.username }}</td>
                            <td>{{ user.email }}</td>
                            <td>
                                <span class="badge"
                                    :class="(user.role === 'ADMIN' || user.type === 'ADMIN') ? 'bg-danger' : 'bg-primary'"
                                    style="cursor: pointer;" @click="changeUserRole(user)">
                                    {{ (user.role === 'ADMIN' || user.type === 'ADMIN') ? 'Admin' : 'User' }}
                                </span>
                            </td>
                            <td>
                                <span class="badge" :class="{
                                    'bg-success': user.status === 'ACTIVE',
                                    'bg-warning': user.status === 'NONE',
                                    'bg-danger': user.status === 'INACTIVE'
                                }">
                                    {{ user.status === 'ACTIVE' ? 'Hoạt động' :
                                        user.status === 'NONE' ? 'Chưa xác thực' : 'Vô hiệu hóa' }}
                                </span>
                            </td>
                            <td>
                                <button class="btn btn-sm btn-info me-1" @click="viewUserDetail(user.id)"
                                    title="Xem chi tiết">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn btn-sm btn-danger" @click="confirmDeleteUser(user.id)"
                                    title="Xóa người dùng">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Phân trang -->
            <nav v-if="totalPages > 1" aria-label="Page navigation" class="mt-4">
                <ul class="pagination justify-content-center">
                    <li class="page-item" :class="{ disabled: currentPage === 1 }">
                        <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">
                            <i class="fas fa-chevron-left"></i>
                        </a>
                    </li>
                    <li v-for="page in totalPages" :key="page" class="page-item"
                        :class="{ active: currentPage === page }">
                        <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
                    </li>
                    <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                        <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">
                            <i class="fas fa-chevron-right"></i>
                        </a>
                    </li>
                </ul>
            </nav>
        </div>
    </div>

    <!-- Modal chi tiết người dùng -->
    <div v-if="showUserModal" class="modal fade show d-block" tabindex="-1" role="dialog" aria-modal="true">
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Chi tiết người dùng</h5>
                    <button type="button" class="btn-close" @click="closeUserModal" aria-label="Close"></button>
                </div>

                <div class="modal-body">
                    <div v-if="selectedUser" class="user-details">
                        <!-- Thông tin chung -->
                        <div class="card mb-3">
                            <div class="card-header bg-primary text-white">
                                <h5 class="mb-0">Thông tin tài khoản</h5>
                            </div>
                            <div class="card-body">
                                <div class="row mb-2">
                                    <div class="col-md-4"><strong>Tên người dùng:</strong></div>
                                    <div class="col-md-8">{{ selectedUser.username }}</div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-md-4"><strong>Email:</strong></div>
                                    <div class="col-md-8">{{ selectedUser.email }}</div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-md-4"><strong>Số điện thoại:</strong></div>
                                    <div class="col-md-8">{{ selectedUser.phone || 'Chưa cập nhật' }}</div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-md-4"><strong>Ngày sinh:</strong></div>
                                    <div class="col-md-8">{{ selectedUser.birthday ? new
                                        Date(selectedUser.birthday).toLocaleDateString() : 'Chưa cập nhật' }}</div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-md-4"><strong>Giới tính:</strong></div>
                                    <div class="col-md-8">
                                        {{ selectedUser.gender === 'MALE' ? 'Nam' :
                                            selectedUser.gender === 'FEMALE' ? 'Nữ' :
                                                selectedUser.gender === 'OTHER' ? 'Khác' : 'Chưa cập nhật'
                                        }}
                                    </div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-md-4"><strong>Vai trò:</strong></div>
                                    <div class="col-md-8">
                                        <span class="badge"
                                            :class="(selectedUser.role === 'ADMIN' || selectedUser.type === 'ADMIN') ? 'bg-danger' : 'bg-primary'">
                                            {{ (selectedUser.role === 'ADMIN' || selectedUser.type === 'ADMIN') ?
                                                'Admin' : 'User' }}
                                        </span>
                                    </div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-md-4"><strong>Trạng thái:</strong></div>
                                    <div class="col-md-8">
                                        <span class="badge" :class="{
                                            'bg-success': selectedUser.status === 'ACTIVE',
                                            'bg-warning': selectedUser.status === 'NONE',
                                            'bg-danger': selectedUser.status === 'INACTIVE'
                                        }">
                                            {{ selectedUser.status === 'ACTIVE' ? 'Hoạt động' :
                                                selectedUser.status === 'NONE' ? 'Chưa xác thực' : 'Vô hiệu hóa' }}
                                        </span>
                                    </div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-md-4"><strong>Ngày tạo tài khoản:</strong></div>
                                    <div class="col-md-8">
                                        {{ selectedUser.createdAt ? new
                                            Date(selectedUser.createdAt).toLocaleString('vi-VN') :
                                            'Chưa có thông tin' }}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Địa chỉ -->
                        <div class="card mb-3">
                            <div class="card-header bg-success text-white">
                                <h5 class="mb-0">Địa chỉ</h5>
                            </div>
                            <div class="card-body">
                                <div v-if="selectedUser.addresses && selectedUser.addresses.length > 0">
                                    <div v-for="(address, index) in selectedUser.addresses" :key="index" class="mb-3">
                                        <h6 class="fw-bold">
                                            {{ address.addressType === 1 ? 'Địa chỉ mặc định' : `Địa chỉ ${index + 1}`
                                            }}
                                        </h6>
                                        <p class="mb-1">{{ formatAddress(address) }}</p>
                                    </div>
                                </div>
                                <div v-else class="text-muted">
                                    Người dùng chưa cập nhật địa chỉ.
                                </div>
                            </div>
                        </div>

                        <!-- Đơn hàng -->
                        <div class="card">
                            <div
                                class="card-header bg-info text-white d-flex justify-content-between align-items-center">
                                <h5 class="mb-0">Đơn hàng đã đặt</h5>
                                <button @click="refreshUserOrders(selectedUser.id)" class="btn btn-sm btn-light"
                                    title="Làm mới">
                                    <i class="fas fa-sync"></i>
                                </button>
                            </div>
                            <div class="card-body">
                                <div v-if="loadingOrders" class="text-center">
                                    <div class="spinner-border text-primary" role="status">
                                        <span class="visually-hidden">Loading...</span>
                                    </div>
                                    <p class="mt-2">Đang tải đơn hàng...</p>
                                </div>
                                <div v-else-if="userOrders && userOrders.length > 0" class="table-responsive">
                                    <table class="table table-hover table-bordered">
                                        <thead>
                                            <tr>
                                                <th>Mã đơn</th>
                                                <th>Ngày đặt</th>
                                                <th>Tổng tiền</th>
                                                <th>Trạng thái</th>
                                                <th>Thanh toán</th>
                                                <th>Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="order in userOrders" :key="order.id">
                                                <td>#{{ order.id }}</td>
                                                <td>{{ order.createdAt ? new
                                                    Date(order.createdAt).toLocaleDateString('vi-VN') : 'N/A' }}</td>
                                                <td>{{ new Intl.NumberFormat('vi-VN', {
                                                    style: 'currency', currency: 'VND'
                                                }).format(order.totalAmount || 0) }}</td>
                                                <td>
                                                    <span class="badge" :class="{
                                                        'bg-warning text-dark': order.status === 'PENDING',
                                                        'bg-info': order.status === 'CONFIRMED',
                                                        'bg-primary': order.status === 'SHIPPING',
                                                        'bg-success': order.status === 'COMPLETED',
                                                        'bg-danger': order.status === 'CANCELLED',
                                                        'bg-secondary': !order.status
                                                    }">
                                                        {{ order.status === 'PENDING' ? 'Chờ xác nhận' :
                                                            order.status === 'CONFIRMED' ? 'Đã xác nhận' :
                                                                order.status === 'SHIPPING' ? 'Đang giao hàng' :
                                                                    order.status === 'COMPLETED' ? 'Hoàn thành' :
                                                                        order.status === 'CANCELLED' ? 'Đã hủy' : order.status || 'N/A'
                                                        }}
                                                    </span>
                                                </td>
                                                <td>{{ order.paymentMethod || 'N/A' }}</td>
                                                <td>
                                                    <button class="btn btn-sm btn-outline-primary"
                                                        @click="goToOrderDetail(order.id)">
                                                        <i class="fas fa-eye me-1"></i> Chi tiết
                                                    </button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div v-else class="text-center text-muted py-4">
                                    <i class="fas fa-shopping-cart fa-3x mb-3"></i>
                                    <h5>Người dùng chưa có đơn hàng nào.</h5>
                                    <p class="mt-2">Người dùng này chưa đặt đơn hàng nào hoặc đơn hàng đã bị xóa.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="closeUserModal">Đóng</button>
                </div>
            </div>
        </div>
    </div>
    <div v-if="showUserModal" class="modal-backdrop fade show"></div>
</template>

<style scoped>
.card {
    border-radius: 0.5rem;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    overflow: hidden;
    margin-bottom: 1.5rem;
}

.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1040;
}

.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1050;
    overflow-x: hidden;
    overflow-y: auto;
    outline: 0;
}

.table {
    width: 100%;
    margin-bottom: 1rem;
    color: #212529;
    vertical-align: middle;
}

.btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
}

.badge {
    font-size: 0.75rem;
    font-weight: 500;
    padding: 0.35em 0.65em;
    margin-right: 0.25rem;
}

.pagination {
    margin-bottom: 0;
}

.pagination .page-link {
    border-radius: 0.25rem;
    margin: 0 2px;
    color: #0d6efd;
    transition: all 0.3s ease;
}

.pagination .page-item.active .page-link {
    background-color: #0d6efd;
    border-color: #0d6efd;
    color: white;
}

.user-details {
    font-size: 0.9rem;
}

/* Custom SweetAlert classes */
:global(.swal-wide) {
    width: 600px !important;
    max-width: 90% !important;
}
</style>