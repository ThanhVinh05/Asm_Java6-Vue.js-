<template>
    <div class="checkout-container">
        <div class="container py-5">
            <div class="row justify-content-center">
                <div class="col-12">
                    <h1 class="display-5 fw-bold mb-4">
                        <i class="fas fa-credit-card text-success me-3"></i>Thanh toán
                    </h1>
                </div>
            </div>

            <!-- Hiển thị khi giỏ hàng trống -->
            <div v-if="selectedItems.length === 0" class="row justify-content-center">
                <div class="col-md-8 text-center py-5">
                    <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted mb-4">Bạn chưa chọn sản phẩm nào để thanh toán</h5>
                    <router-link to="/cart" class="btn btn-success">
                        <i class="fas fa-shopping-cart me-2"></i>Quay lại giỏ hàng
                    </router-link>
                </div>
            </div>

            <!-- Hiển thị khi giỏ hàng có sản phẩm -->
            <div v-else class="row justify-content-center">
                <div class="col-lg-8">
                    <div class="card border-0 shadow-sm mb-4">
                        <div class="card-body p-4">
                            <h5 class="card-title mb-4">
                                <i class="fas fa-shipping-fast text-success me-2"></i>
                                Thông tin giao hàng
                            </h5>

                            <div v-if="userInfo" class="mb-4">
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <h6 class="mb-0">Thông tin người nhận</h6>
                                    <button class="btn btn-outline-success btn-sm" @click="showModal"
                                        data-bs-toggle="modal" data-bs-target="#changeAddressModal">
                                        <i class="fas fa-edit me-2"></i>Đổi địa chỉ
                                    </button>
                                </div>
                                <div class="card bg-light">
                                    <div class="card-body">
                                        <p class="mb-1"><strong>Họ và tên:</strong> {{ userInfo.username }}</p>
                                        <p class="mb-1"><strong>Email:</strong> {{ userInfo.email }}</p>
                                        <p class="mb-1"><strong>Số điện thoại:</strong>
                                            {{ userInfo.phone || 'Chưa cập nhật' }}</p>
                                        <p class="mb-0">
                                            <strong>Địa chỉ:</strong>
                                            <span v-if="defaultAddress">
                                                {{ defaultAddress.streetNumber }}, {{ defaultAddress.commune }},
                                                {{ defaultAddress.district }}, {{ defaultAddress.city }}
                                            </span>
                                            <span v-else class="text-danger">Chưa có địa chỉ</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div v-else class="d-flex justify-content-center mb-4">
                                <div class="spinner-border text-success" role="status">
                                    <span class="visually-hidden">Đang tải...</span>
                                </div>
                            </div>

                            <hr class="my-4">

                            <h5 class="mb-3">Phương thức thanh toán</h5>
                            <div class="form-check mb-2">
                                <input type="radio" class="form-check-input" id="cod" value="COD"
                                    v-model="form.paymentMethod" required>
                                <label class="form-check-label" for="cod">
                                    <i class="fas fa-money-bill-wave text-success me-2"></i>
                                    Thanh toán khi nhận hàng (COD)
                                </label>
                            </div>
                            <div class="form-check mb-2">
                                <input type="radio" class="form-check-input" id="bank" value="BANK"
                                    v-model="form.paymentMethod" required>
                                <label class="form-check-label" for="bank">
                                    <i class="fas fa-university text-success me-2"></i>
                                    Chuyển khoản ngân hàng
                                </label>
                            </div>
                            <div class="form-check">
                                <input type="radio" class="form-check-input" id="momo" value="MOMO"
                                    v-model="form.paymentMethod" required>
                                <label class="form-check-label" for="momo">
                                    <i class="fas fa-wallet text-success me-2"></i>
                                    Ví MoMo
                                </label>
                            </div>

                            <div class="mt-3">
                                <label for="note" class="form-label">Ghi chú (không bắt buộc)</label>
                                <textarea class="form-control" id="note" v-model="form.note" rows="2"></textarea>
                            </div>

                            <div class="d-grid gap-2 mt-4">
                                <button type="button" class="btn btn-success btn-lg"
                                    :disabled="isLoading || !defaultAddress || !userInfo" @click="placeOrder">
                                    <span v-if="isLoading">
                                        <span class="spinner-border spinner-border-sm" role="status"
                                            aria-hidden="true"></span>
                                        Đang xử lý...
                                    </span>
                                    <span v-else>
                                        <i class="fas fa-lock me-2"></i>Đặt hàng
                                    </span>
                                </button>
                                <router-link to="/cart" class="btn btn-outline-secondary">
                                    <i class="fas fa-arrow-left me-2"></i>Quay lại giỏ hàng
                                </router-link>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-lg-4">
                    <div class="card border-0 shadow-sm mb-4">
                        <div class="card-body">
                            <h5 class="card-title mb-4">Đơn hàng của bạn</h5>
                            <div class="order-items">
                                <div v-for="item in selectedItems" :key="item.productId"
                                    class="d-flex justify-content-between align-items-center mb-3">
                                    <div class="d-flex align-items-center">
                                        <img :src="getFirstImageUrl(item.product.image)" class="img-fluid rounded me-2"
                                            style="width: 50px; height: 50px; object-fit: cover;"
                                            :alt="item.product.productName">
                                        <div>
                                            <h6 class="mb-0">{{ item.product.productName }}</h6>
                                            <small class="text-muted">Số lượng: {{ item.quantity }}</small>
                                        </div>
                                    </div>
                                    <span>${{ (item.product.productPrice * item.quantity).toFixed(2) }}</span>
                                </div>
                            </div>

                            <hr>

                            <div class="d-flex justify-content-between mb-2">
                                <span>Tạm tính:</span>
                                <span>${{ checkoutSubtotal.toFixed(2) }}</span>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span>Phí vận chuyển:</span>
                                <span>${{ shippingFee.toFixed(2) }}</span>
                            </div>
                            <hr>
                            <div class="d-flex justify-content-between mb-0">
                                <strong>Tổng cộng:</strong>
                                <strong class="text-success">${{ checkoutTotal.toFixed(2) }}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal fade" id="changeAddressModal" tabindex="-1" aria-labelledby="changeAddressModalLabel"
                aria-hidden="true" ref="addressModal">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="changeAddressModalLabel">Thay đổi địa chỉ</h5>
                            <button type="button" class="btn-close" @click="hideModal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form @submit.prevent="updateAddress">
                                <div class="row g-3">
                                    <div class="col-md-4">
                                        <label for="province" class="form-label">Tỉnh/Thành phố</label>
                                        <select class="form-select" id="province" v-model="addressForm.province"
                                            :class="{ 'is-invalid': addressErrors.province }" required
                                            @change="onProvinceChange">
                                            <option value="">Chọn tỉnh/thành phố</option>
                                            <option v-for="province in provinces" :key="province.code"
                                                :value="province.code">
                                                {{ province.displayName || province.name }}
                                            </option>
                                        </select>
                                        <div class="invalid-feedback" v-if="addressErrors.province">
                                            {{ addressErrors.province }}
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <label for="district" class="form-label">Quận/Huyện</label>
                                        <select class="form-select" id="district" v-model="addressForm.district"
                                            :class="{ 'is-invalid': addressErrors.district }" required
                                            @change="onDistrictChange" :disabled="!addressForm.province">
                                            <option value="">Chọn quận/huyện</option>
                                            <option v-for="district in districts" :key="district.code"
                                                :value="district.code">
                                                {{ district.displayName || district.name }}
                                            </option>
                                        </select>
                                        <div class="invalid-feedback" v-if="addressErrors.district">
                                            {{ addressErrors.district }}
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <label for="ward" class="form-label">Phường/Xã</label>
                                        <select class="form-select" id="ward" v-model="addressForm.ward"
                                            :class="{ 'is-invalid': addressErrors.ward }" required
                                            :disabled="!addressForm.district">
                                            <option value="">Chọn phường/xã</option>
                                            <option v-for="ward in wards" :key="ward.code" :value="ward.code">
                                                {{ ward.displayName || ward.name }}
                                            </option>
                                        </select>
                                        <div class="invalid-feedback" v-if="addressErrors.ward">
                                            {{ addressErrors.ward }}
                                        </div>
                                    </div>
                                </div>

                                <div class="mt-3">
                                    <label for="streetNumber" class="form-label">Số nhà, tên đường</label>
                                    <input type="text" class="form-control" id="streetNumber"
                                        v-model="addressForm.streetNumber"
                                        :class="{ 'is-invalid': addressErrors.streetNumber }" required>
                                    <div class="invalid-feedback" v-if="addressErrors.streetNumber">
                                        {{ addressErrors.streetNumber }}
                                    </div>
                                </div>

                                <div class="mt-4">
                                    <button type="submit" class="btn btn-success" :disabled="isUpdatingAddress">
                                        <span v-if="isUpdatingAddress">
                                            <span class="spinner-border spinner-border-sm" role="status"
                                                aria-hidden="true"></span>
                                            Đang cập nhật...
                                        </span>
                                        <span v-else>
                                            <i class="fas fa-save me-2"></i>Lưu địa chỉ
                                        </span>
                                    </button>
                                    <button type="button" class="btn btn-secondary ms-2" @click="hideModal">
                                        Hủy
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { getCartItems, removeFromCart } from '../../api/cart';
import { createOrder } from '../../api/order';
import { getUserProfile } from '../../api/user';
import { getProvinces, getDistricts, getWards, updateUserAddress } from '../../api/address';
import Swal from 'sweetalert2';
import axios from 'axios';
import { cartStore } from '../../store/cartStore';

export default {
    setup() {
        const router = useRouter();
        const selectedItems = ref([]);
        const shippingFee = ref(5.00);
        const isLoading = ref(false);
        const isUpdatingAddress = ref(false);
        const showChangeAddressModal = ref(false);
        const userInfo = ref(null);
        const defaultAddress = ref(null);
        const provinces = ref([]);
        const districts = ref([]);
        const wards = ref([]);
        const addressModal = ref(null);
        const checkoutSubtotal = ref(0);
        const checkoutTotal = ref(0);
        let modal = null;

        const form = ref({
            note: '',
            paymentMethod: 'COD'
        });

        const addressForm = ref({
            streetNumber: '',
            province: '',
            district: '',
            ward: ''
        });

        const addressErrors = ref({});

        const getFirstImageUrl = (imageJson) => {
            try {
                const images = JSON.parse(imageJson);
                return images && images.length > 0 ? `/src/assets/img/${images[0]}` : null;
            } catch (error) {
                console.error('Error parsing image JSON:', error);
                return null;
            }
        };

        const loadSelectedItems = () => {
            try {
                const items = localStorage.getItem('checkoutItems');
                if (items) {
                    selectedItems.value = JSON.parse(items);
                } else {
                    selectedItems.value = [];
                }

                // Load saved subtotal and total
                const subtotal = localStorage.getItem('checkoutSubtotal');
                const total = localStorage.getItem('checkoutTotal');
                if (subtotal) checkoutSubtotal.value = parseFloat(subtotal);
                if (total) checkoutTotal.value = parseFloat(total);

                console.log('Loaded selected items:', selectedItems.value.length);
            } catch (error) {
                console.error('Error loading selected items:', error);
                selectedItems.value = [];
                checkoutSubtotal.value = 0;
                checkoutTotal.value = 0;
            }
        };

        const loadUserInfo = async () => {
            try {
                const response = await getUserProfile();
                console.log('User profile response:', response);

                // Dữ liệu người dùng trả về trực tiếp, không nằm trong nested data object
                if (response) {
                    userInfo.value = {
                        id: response.id,
                        username: response.username,
                        email: response.email,
                        phone: response.phone,
                        gender: response.gender,
                        birthday: response.birthday
                    };

                    console.log('Loaded user info:', userInfo.value);

                    // Kiểm tra và gán địa chỉ mặc định
                    if (response.addresses && response.addresses.length > 0) {
                        // Đảm bảo không có trường nào bị null
                        const address = response.addresses[0];
                        defaultAddress.value = {
                            streetNumber: address.streetNumber || '',
                            commune: address.commune || '',
                            district: address.district || '',
                            city: address.city || '',
                            country: address.country || 'Việt Nam',
                            addressType: address.addressType || 1
                        };
                        console.log('Default address:', defaultAddress.value);
                    } else {
                        // Tạo một địa chỉ mặc định trống nếu không có
                        defaultAddress.value = {
                            streetNumber: '',
                            commune: '',
                            district: '',
                            city: '',
                            country: 'Việt Nam',
                            addressType: 1
                        };
                        console.log('Created empty default address');
                    }
                } else {
                    console.error('Empty response from getUserProfile');
                    userInfo.value = null;
                    defaultAddress.value = null;
                }
            } catch (error) {
                console.error('Error loading user info:', error);
                userInfo.value = null;
                defaultAddress.value = null;
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi',
                    text: 'Không thể tải thông tin người dùng'
                });
            }
        };

        const loadProvinces = async () => {
            try {
                provinces.value = await getProvinces();
            } catch (error) {
                console.error('Error loading provinces:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi',
                    text: 'Không thể tải danh sách tỉnh/thành phố'
                });
            }
        };

        const onProvinceChange = async () => {
            if (addressForm.value.province) {
                try {
                    districts.value = await getDistricts(addressForm.value.province);
                    addressForm.value.district = '';
                    addressForm.value.ward = '';
                    wards.value = [];
                } catch (error) {
                    console.error('Error loading districts:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Lỗi',
                        text: 'Không thể tải danh sách quận/huyện'
                    });
                }
            }
        };

        const onDistrictChange = async () => {
            if (addressForm.value.district) {
                try {
                    console.log('Đang tải danh sách phường/xã cho mã quận:', addressForm.value.district);
                    addressForm.value.ward = '';

                    // Thêm timeout để tránh request quá nhanh
                    await new Promise(resolve => setTimeout(resolve, 300));

                    wards.value = await getWards(addressForm.value.district);
                    console.log('Đã tải được', wards.value.length, 'phường/xã');
                } catch (err) {
                    console.error("Lỗi khi gọi API qua service:", err);
                    // Backup: Thử gọi API trực tiếp
                    const response = await axios.get(`https://vn-public-apis.fpo.vn/wards/getByDistrict?districtCode=${addressForm.value.district}&limit=-1`);
                    if (response.data && response.data.data && response.data.data.data) {
                        wards.value = response.data.data.data;
                    } else {
                        throw new Error("Không thể tải dữ liệu phường/xã");
                    }
                }
            } else {
                wards.value = [];
                addressForm.value.ward = '';
            }
        };

        const validateAddressForm = () => {
            addressErrors.value = {};
            let isValid = true;

            if (!addressForm.value.streetNumber) {
                addressErrors.value.streetNumber = 'Vui lòng nhập số nhà, tên đường';
                isValid = false;
            }

            if (!addressForm.value.province) {
                addressErrors.value.province = 'Vui lòng chọn tỉnh/thành phố';
                isValid = false;
            }

            if (!addressForm.value.district) {
                addressErrors.value.district = 'Vui lòng chọn quận/huyện';
                isValid = false;
            }

            if (!addressForm.value.ward) {
                addressErrors.value.ward = 'Vui lòng chọn phường/xã';
                isValid = false;
            }

            return isValid;
        };

        const updateAddress = async () => {
            if (!validateAddressForm()) return;

            isUpdatingAddress.value = true;
            try {
                const selectedProvince = provinces.value.find(p => p.code === addressForm.value.province);
                const selectedDistrict = districts.value.find(d => d.code === addressForm.value.district);
                const selectedWard = wards.value.find(w => w.code === addressForm.value.ward);

                if (!selectedProvince || !selectedDistrict || !selectedWard) {
                    throw new Error('Thông tin địa chỉ không hợp lệ');
                }

                if (!addressForm.value.streetNumber.trim()) {
                    throw new Error('Vui lòng nhập số nhà, tên đường');
                }

                // Tạo mảng địa chỉ với chỉ 1 địa chỉ duy nhất
                const addresses = [{
                    streetNumber: addressForm.value.streetNumber.trim(),
                    commune: selectedWard.displayName || selectedWard.name,
                    district: selectedDistrict.displayName || selectedDistrict.name,
                    city: selectedProvince.displayName || selectedProvince.name,
                    country: 'Việt Nam',
                    addressType: 1
                }];

                console.log('Updating address with data:', addresses);
                await updateUserAddress(addresses);

                // Cập nhật lại thông tin người dùng và địa chỉ
                await loadUserInfo();

                // Đóng modal và xóa backdrop
                hideModal();

                // Xóa hoàn toàn backdrop sau 100ms để đảm bảo không còn lớp phủ mờ 
                setTimeout(() => {
                    const backdrops = document.querySelectorAll('.modal-backdrop');
                    backdrops.forEach(backdrop => {
                        backdrop.remove();
                    });
                    document.body.classList.remove('modal-open');
                    document.body.style.overflow = '';
                }, 100);

                Swal.fire({
                    icon: 'success',
                    title: 'Thành công',
                    text: 'Đã cập nhật địa chỉ thành công',
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (error) {
                console.error('Error updating address:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi',
                    text: error.message || 'Không thể cập nhật địa chỉ'
                });
            } finally {
                isUpdatingAddress.value = false;
            }
        };

        // Xóa các sản phẩm đã chọn khỏi giỏ hàng
        const removeSelectedItems = async () => {
            try {
                // Xóa từng mục đã chọn
                for (const item of selectedItems.value) {
                    await removeFromCart(item.productId);
                }
                await cartStore.updateCartCount();

                // Xóa dữ liệu từ localStorage
                localStorage.removeItem('checkoutItems');
                localStorage.removeItem('checkoutSubtotal');
                localStorage.removeItem('checkoutShippingFee');
                localStorage.removeItem('checkoutTotal');
            } catch (error) {
                console.error('Error removing selected items:', error);
                throw error;
            }
        };

        const placeOrder = async () => {
            if (selectedItems.value.length === 0) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Không có sản phẩm',
                    text: 'Vui lòng chọn sản phẩm để thanh toán'
                });
                return;
            }

            if (!userInfo.value) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Thiếu thông tin',
                    text: 'Không thể tải thông tin người dùng. Vui lòng đăng nhập lại.'
                });
                return;
            }

            // Kiểm tra xem địa chỉ có thông tin đầy đủ không
            if (!defaultAddress.value ||
                !defaultAddress.value.streetNumber ||
                !defaultAddress.value.commune ||
                !defaultAddress.value.district ||
                !defaultAddress.value.city) {
                // Hiển thị modal để cập nhật địa chỉ
                Swal.fire({
                    icon: 'warning',
                    title: 'Thiếu thông tin địa chỉ',
                    text: 'Vui lòng cập nhật đầy đủ thông tin địa chỉ giao hàng trước khi đặt hàng',
                    confirmButtonText: 'Cập nhật địa chỉ'
                }).then((result) => {
                    if (result.isConfirmed) {
                        showModal();
                    }
                });
                return;
            }

            isLoading.value = true;
            try {
                const orderData = {
                    ...form.value,
                    items: selectedItems.value.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.product.productPrice
                    })),
                    totalAmount: checkoutTotal.value
                };

                console.log('Sending order data:', orderData);
                await createOrder(orderData);

                // Xóa các sản phẩm đã chọn khỏi giỏ hàng
                await removeSelectedItems();

                await Swal.fire({
                    icon: 'success',
                    title: 'Đặt hàng thành công!',
                    text: 'Cảm ơn bạn đã mua hàng. Chúng tôi sẽ sớm liên hệ với bạn.',
                    confirmButtonText: 'Xem đơn hàng'
                });

                router.push('/orders');
            } catch (error) {
                console.error('Error placing order:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi',
                    text: error.message || 'Không thể đặt hàng. Vui lòng thử lại sau.'
                });
            } finally {
                isLoading.value = false;
            }
        };

        onMounted(async () => {
            try {
                await Promise.all([
                    loadSelectedItems(),
                    loadUserInfo(),
                    loadProvinces()
                ]);

                if (window.bootstrap) {
                    const modalElement = document.getElementById('changeAddressModal');
                    if (modalElement) {
                        modal = new window.bootstrap.Modal(modalElement);
                    }
                }
            } catch (error) {
                console.error('Error in onMounted:', error);
            }
        });

        const showModal = async () => {
            try {
                console.log('showModal được gọi');
                // Reset form errors
                addressErrors.value = {};

                // Pre-fill address form with current address if available
                if (defaultAddress.value) {
                    // Điền thông tin số nhà
                    addressForm.value.streetNumber = defaultAddress.value.streetNumber || '';

                    // Tải danh sách tỉnh/thành phố nếu chưa có
                    if (provinces.value.length === 0) {
                        await loadProvinces();
                    }

                    console.log('Default address for form:', defaultAddress.value);
                }

                // Ưu tiên sử dụng bootstrap 5
                const modalElement = document.getElementById('changeAddressModal');

                if (!modalElement) {
                    console.error('Không tìm thấy modal element');
                    return;
                }

                // Phương pháp 1: Sử dụng Bootstrap 5 JS API
                if (window.bootstrap) {
                    console.log('Sử dụng Bootstrap 5 Modal API');
                    try {
                        // Khởi tạo modal nếu chưa có
                        if (!modal) {
                            modal = new window.bootstrap.Modal(modalElement);
                        }
                        modal.show();
                        return;
                    } catch (err) {
                        console.error('Lỗi khi sử dụng Bootstrap Modal API:', err);
                    }
                }

                // Phương pháp 2: Sử dụng jQuery nếu có
                if (window.jQuery || window.$) {
                    console.log('Sử dụng jQuery để hiển thị modal');
                    try {
                        const $ = window.jQuery || window.$;
                        $(modalElement).modal('show');
                        return;
                    } catch (err) {
                        console.error('Lỗi khi sử dụng jQuery modal:', err);
                    }
                }

                // Phương pháp 3: Thêm classes và styles trực tiếp
                console.log('Hiển thị modal bằng CSS trực tiếp');

                // Tạo backdrop nếu cần
                let backdrop = document.querySelector('.modal-backdrop');
                if (!backdrop) {
                    backdrop = document.createElement('div');
                    backdrop.className = 'modal-backdrop fade show';
                    document.body.appendChild(backdrop);
                }

                // Hiển thị modal
                modalElement.classList.add('show');
                modalElement.setAttribute('aria-modal', 'true');
                modalElement.setAttribute('role', 'dialog');
                modalElement.removeAttribute('aria-hidden');
                modalElement.style.display = 'block';
                document.body.classList.add('modal-open');

                // Thêm overflow hidden vào body
                document.body.style.overflow = 'hidden';
                document.body.style.paddingRight = '17px'; // Bù cho scrollbar

            } catch (error) {
                console.error('Error showing modal:', error);
                alert('Không thể hiển thị form thay đổi địa chỉ. Vui lòng thử lại sau.');
            }
        };

        const hideModal = () => {
            try {
                console.log('hideModal được gọi');
                const modalElement = document.getElementById('changeAddressModal');

                if (!modalElement) {
                    console.error('Không tìm thấy modal element khi đóng');
                    return;
                }

                // Phương pháp 1: Sử dụng Bootstrap Modal API
                if (modal) {
                    console.log('Đóng modal bằng Bootstrap Modal API');
                    modal.hide();
                }

                // Xóa backdrop bất kể phương pháp nào được sử dụng
                const backdrops = document.querySelectorAll('.modal-backdrop');
                backdrops.forEach(backdrop => {
                    backdrop.remove();
                });

                // Đóng modal trực tiếp
                modalElement.classList.remove('show');
                modalElement.style.display = 'none';
                modalElement.setAttribute('aria-hidden', 'true');
                modalElement.removeAttribute('aria-modal');
                modalElement.removeAttribute('role');

                // Xóa class và style từ body
                document.body.classList.remove('modal-open');
                document.body.style.overflow = '';
                document.body.style.paddingRight = '';

            } catch (error) {
                console.error('Error hiding modal:', error);

                // Backup: xóa bằng jQuery nếu có
                if (window.jQuery) {
                    try {
                        window.jQuery('#changeAddressModal').modal('hide');
                        window.jQuery('.modal-backdrop').remove();
                    } catch (e) {
                        console.error('Không thể xóa modal bằng jQuery:', e);
                    }
                }
            }
        };

        return {
            selectedItems,
            form,
            userInfo,
            defaultAddress,
            provinces,
            districts,
            wards,
            addressForm,
            addressErrors,
            checkoutSubtotal,
            checkoutTotal,
            shippingFee,
            isLoading,
            isUpdatingAddress,
            showChangeAddressModal,
            getFirstImageUrl,
            onProvinceChange,
            onDistrictChange,
            updateAddress,
            placeOrder,
            showModal,
            hideModal,
            addressModal
        };
    }
};
</script>
<style scoped>
.checkout-container {
    background-color: #f8f9fa;
    min-height: 100vh;
}

.form-label {
    font-weight: 500;
    color: #495057;
}

.form-control:focus,
.form-select:focus {
    box-shadow: none;
    border-color: #198754;
}

.form-check-input:checked {
    background-color: #198754;
    border-color: #198754;
}

.order-items {
    max-height: 300px;
    overflow-y: auto;
    padding-right: 10px;
}

.order-items::-webkit-scrollbar {
    width: 5px;
}

.order-items::-webkit-scrollbar-track {
    background: #f1f1f1;
}

.order-items::-webkit-scrollbar-thumb {
    background: #198754;
    border-radius: 5px;
}

@media (max-width: 991.98px) {
    .order-items {
        max-height: none;
    }
}

/* Modal styles */
:deep(.modal-backdrop) {
    z-index: 1040;
    opacity: 0.5;
}

:deep(.modal) {
    z-index: 1050;
    pointer-events: auto;
}

:deep(.modal-dialog) {
    margin: 2rem auto;
    pointer-events: auto;
}

:deep(.modal-content) {
    border: none;
    border-radius: 1rem;
    pointer-events: auto;
}

:deep(.modal-header) {
    border-bottom: 1px solid #dee2e6;
    padding: 1.5rem;
}

:deep(.modal-body) {
    padding: 1.5rem;
}

:deep(.btn-close) {
    pointer-events: auto;
    cursor: pointer;
}
</style>

<style>
/* Global styles cho modal - giới hạn phạm vi ảnh hưởng */
#changeAddressModal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 2000 !important;
}

#changeAddressModal.show {
    display: block !important;
    opacity: 1 !important;
}

#changeAddressModal .modal-dialog {
    position: relative;
    max-width: 700px;
    margin: 1.75rem auto;
    pointer-events: auto !important;
    z-index: 2001 !important;
}

#changeAddressModal .modal-content {
    position: relative;
    display: flex;
    flex-direction: column;
    background-color: #fff;
    pointer-events: auto !important;
    background-clip: padding-box;
    border: 1px solid rgba(0, 0, 0, 0.2);
    border-radius: 0.3rem;
    outline: 0;
    z-index: 2002 !important;
}

#changeAddressModal .modal-header {
    pointer-events: auto !important;
    z-index: 2003 !important;
}

#changeAddressModal .modal-body {
    pointer-events: auto !important;
    z-index: 2003 !important;
}

#changeAddressModal .form-select,
#changeAddressModal .form-control,
#changeAddressModal button {
    pointer-events: auto !important;
    position: relative;
    z-index: 2004 !important;
}

/* Chỉ ảnh hưởng đến backdrop của #changeAddressModal */
#changeAddressModal+.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1040 !important;
    width: 100vw;
    height: 100vh;
    background-color: #000;
    opacity: 0.5 !important;
}

/* Tránh xung đột với dropdown */
.dropdown-menu {
    z-index: 2100 !important;
}

/* Đảm bảo dropdown hoạt động */
.navbar .dropdown-menu.show {
    display: block !important;
}
</style>