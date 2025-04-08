<template>
    <div class="container py-5">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card border-0 shadow-sm profile-card">
                    <div class="card-header bg-white border-0 py-4">
                        <h4 class="text-center mb-0">
                            <i class="fas fa-user-circle me-2 text-success"></i>
                            Thông tin tài khoản
                        </h4>
                    </div>
                    <div class="card-body p-4">
                        <div v-if="loading" class="text-center py-5">
                            <div class="spinner-border text-success" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </div>
                        <form v-else @submit.prevent="updateProfile" class="needs-validation" novalidate>
                            <!-- Thông tin cơ bản -->
                            <div class="section-title mb-4">
                                <h5 class="text-success">
                                    <i class="fas fa-info-circle me-2"></i>
                                    Thông tin cơ bản
                                </h5>
                            </div>
                            <div class="row g-3 mb-4">
                                <div class="col-md-6">
                                    <label for="username" class="form-label">Tên đăng nhập</label>
                                    <div class="input-group">
                                        <span class="input-group-text bg-light">
                                            <i class="fas fa-user text-success"></i>
                                        </span>
                                        <input type="text" class="form-control" id="username" v-model="profile.username"
                                            readonly />
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <label for="email" class="form-label">Email</label>
                                    <div class="input-group">
                                        <span class="input-group-text bg-light">
                                            <i class="fas fa-envelope text-success"></i>
                                        </span>
                                        <input type="email" class="form-control" id="email" v-model="profile.email" />
                                    </div>
                                </div>
                            </div>

                            <div class="row g-3 mb-4">
                                <div class="col-md-6">
                                    <label for="phone" class="form-label">Điện thoại</label>
                                    <div class="input-group">
                                        <span class="input-group-text bg-light">
                                            <i class="fas fa-phone text-success"></i>
                                        </span>
                                        <input type="text" class="form-control" id="phone" v-model="profile.phone" />
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <label for="birthday" class="form-label">Ngày sinh</label>
                                    <div class="input-group">
                                        <span class="input-group-text bg-light">
                                            <i class="fas fa-calendar text-success"></i>
                                        </span>
                                        <input type="date" class="form-control" id="birthday"
                                            v-model="profile.birthday" />
                                    </div>
                                </div>
                            </div>

                            <div class="mb-4">
                                <label for="gender" class="form-label">Giới tính</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-light">
                                        <i class="fas fa-venus-mars text-success"></i>
                                    </span>
                                    <select class="form-select" id="gender" v-model="profile.gender">
                                        <option value="MALE">Nam</option>
                                        <option value="FEMALE">Nữ</option>
                                        <option value="OTHER">Khác</option>
                                    </select>
                                </div>
                            </div>

                            <!-- Địa chỉ -->
                            <div class="section-title mb-4">
                                <h5 class="text-success">
                                    <i class="fas fa-map-marker-alt me-2"></i>
                                    Thông tin địa chỉ
                                </h5>
                            </div>
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label for="province" class="form-label">Tỉnh/Thành phố</label>
                                    <div class="input-group">
                                        <span class="input-group-text bg-light">
                                            <i class="fas fa-city text-success"></i>
                                        </span>
                                        <select class="form-select" id="province" v-model="selectedCity"
                                            @change="handleCityChange(selectedCity)">
                                            <option value="">Chọn tỉnh/thành phố</option>
                                            <option v-for="province in provinces" :key="province.code"
                                                :value="province">
                                                {{ province.name }}
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                <div class="col-md-6">
                                    <label for="district" class="form-label">Quận/Huyện</label>
                                    <div class="input-group">
                                        <span class="input-group-text bg-light">
                                            <i class="fas fa-map-marker-alt text-success"></i>
                                        </span>
                                        <select class="form-select" id="district" v-model="selectedDistrict"
                                            @change="handleDistrictChange(selectedDistrict)" :disabled="!selectedCity">
                                            <option value="">Chọn quận/huyện</option>
                                            <option v-for="district in districts" :key="district.code"
                                                :value="district">
                                                {{ district.name }}
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                <div class="col-md-6">
                                    <label for="ward" class="form-label">Phường/Xã</label>
                                    <div class="input-group">
                                        <span class="input-group-text bg-light">
                                            <i class="fas fa-map-marked-alt text-success"></i>
                                        </span>
                                        <select class="form-select" id="ward" v-model="selectedWard"
                                            :disabled="!selectedDistrict">
                                            <option value="">Chọn phường/xã</option>
                                            <option v-for="ward in wards" :key="ward.code" :value="ward">
                                                {{ ward.name }}
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                <div class="col-md-6">
                                    <label for="streetNumber" class="form-label">Số nhà, tên đường</label>
                                    <div class="input-group">
                                        <span class="input-group-text bg-light">
                                            <i class="fas fa-home text-success"></i>
                                        </span>
                                        <input type="text" class="form-control" id="streetNumber"
                                            v-model="address.streetNumber" />
                                    </div>
                                </div>

                                <div class="col-md-6">
                                    <label for="addressType" class="form-label">Loại địa chỉ</label>
                                    <div class="input-group">
                                        <span class="input-group-text bg-light">
                                            <i class="fas fa-tag text-success"></i>
                                        </span>
                                        <select class="form-select" id="addressType" v-model="address.addressType">
                                            <option value="1">Nhà riêng</option>
                                            <option value="2">Văn phòng</option>
                                            <option value="3">Khác</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div class="d-grid gap-2 mt-4">
                                <button type="submit" class="btn btn-success" :disabled="saving">
                                    <span v-if="saving">
                                        <span class="spinner-border spinner-border-sm" role="status"
                                            aria-hidden="true"></span>
                                        Đang lưu...
                                    </span>
                                    <span v-else>
                                        <i class="fas fa-save me-2"></i>Lưu thông tin
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { getUserProfile, updateUserProfile } from '../api/user';
import { getProvinces, getDistricts, getWards } from '../api/address';
import Swal from 'sweetalert2';

export default {
    setup() {
        const loading = ref(true);
        const saving = ref(false);
        const profile = ref({
            username: '',
            email: '',
            phone: '',
            birthday: '',
            gender: ''
        });
        const address = ref({
            streetNumber: '',
            commune: '',
            district: '',
            city: '',
            country: 'Việt Nam',
            addressType: 1
        });

        const provinces = ref([]);
        const districts = ref([]);
        const wards = ref([]);
        const selectedCity = ref(null);
        const selectedDistrict = ref(null);
        const selectedWard = ref(null);

        // Hàm chuẩn hóa tên để so sánh
        const normalizeName = (name) => {
            if (!name) return '';
            return name.toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/đ/g, 'd')
                .replace(/Đ/g, 'D')
                .trim();
        };

        // Hàm tự động chọn địa chỉ dựa trên dữ liệu từ database
        const autoSelectAddress = async (userAddress) => {
            try {
                console.log('Starting address selection with:', userAddress);

                // 1. Load tất cả tỉnh/thành phố
                provinces.value = await getProvinces();

                // 2. Tìm và chọn thành phố
                const cityName = normalizeName(userAddress.city);
                console.log('Looking for city:', cityName);

                // Phương pháp 1: Tìm kiếm chính xác
                let foundCity = provinces.value.find(p =>
                    normalizeName(p.name) === cityName
                );

                // Phương pháp 2: Tìm kiếm một phần
                if (!foundCity) {
                    foundCity = provinces.value.find(p => {
                        const provinceName = normalizeName(p.name);
                        return provinceName.includes(cityName) || cityName.includes(provinceName);
                    });
                }

                // Phương pháp 3: Nếu là Hồ Chí Minh, thử các biến thể
                if (!foundCity && (
                    cityName.includes('ho chi minh') ||
                    cityName.includes('hcm') ||
                    cityName.includes('tphcm')
                )) {
                    foundCity = provinces.value.find(p => {
                        const name = normalizeName(p.name);
                        return name.includes('ho chi minh') || name.includes('hcm');
                    });
                }

                // Phương pháp 4: Nếu là Hà Nội, thử các biến thể
                if (!foundCity && (
                    cityName.includes('ha noi') ||
                    cityName.includes('hanoi')
                )) {
                    foundCity = provinces.value.find(p => {
                        const name = normalizeName(p.name);
                        return name.includes('ha noi') || name.includes('hanoi');
                    });
                }

                if (foundCity) {
                    console.log('Found city:', foundCity);
                    selectedCity.value = foundCity;

                    // 3. Load và chọn quận/huyện
                    districts.value = await getDistricts(foundCity.code);
                    const districtName = normalizeName(userAddress.district);
                    console.log('Looking for district:', districtName);

                    // Tương tự, thử nhiều cách tìm quận/huyện
                    let foundDistrict = districts.value.find(d =>
                        normalizeName(d.name) === districtName
                    );

                    if (!foundDistrict) {
                        // Tìm quận/huyện có chứa tên
                        foundDistrict = districts.value.find(d => {
                            const normalizedDistrict = normalizeName(d.name);
                            return normalizedDistrict.includes(districtName) || districtName.includes(normalizedDistrict);
                        });
                    }

                    // Loại bỏ tiền tố "quan" hoặc "huyen" nếu có
                    if (!foundDistrict) {
                        const searchDistrict = districtName
                            .replace(/^quan\s+/, '')
                            .replace(/^huyen\s+/, '');

                        foundDistrict = districts.value.find(d => {
                            const normalizedDistrict = normalizeName(d.name)
                                .replace(/^quan\s+/, '')
                                .replace(/^huyen\s+/, '');
                            return normalizedDistrict.includes(searchDistrict) || searchDistrict.includes(normalizedDistrict);
                        });
                    }

                    if (foundDistrict) {
                        console.log('Found district:', foundDistrict);
                        selectedDistrict.value = foundDistrict;

                        // 4. Load và chọn phường/xã
                        wards.value = await getWards(foundDistrict.code);
                        const wardName = normalizeName(userAddress.commune);
                        console.log('Looking for ward:', wardName);

                        // Tương tự, thử nhiều cách tìm phường/xã
                        let foundWard = wards.value.find(w =>
                            normalizeName(w.name) === wardName
                        );

                        if (!foundWard) {
                            foundWard = wards.value.find(w => {
                                const normalizedWard = normalizeName(w.name);
                                return normalizedWard.includes(wardName) || wardName.includes(normalizedWard);
                            });
                        }

                        // Loại bỏ tiền tố "phuong" hoặc "xa" nếu có
                        if (!foundWard) {
                            const searchWard = wardName
                                .replace(/^phuong\s+/, '')
                                .replace(/^xa\s+/, '');

                            foundWard = wards.value.find(w => {
                                const normalizedWard = normalizeName(w.name)
                                    .replace(/^phuong\s+/, '')
                                    .replace(/^xa\s+/, '');
                                return normalizedWard.includes(searchWard) || searchWard.includes(normalizedWard);
                            });
                        }

                        if (foundWard) {
                            console.log('Found ward:', foundWard);
                            selectedWard.value = foundWard;
                            address.value.commune = foundWard.name;
                        } else {
                            console.log('Ward not found');
                        }
                    } else {
                        console.log('District not found');
                    }
                } else {
                    console.log('City not found');
                }
            } catch (error) {
                console.error('Error in autoSelectAddress:', error);
            }
        };

        // Hàm load thông tin người dùng
        const loadUserProfile = async () => {
            try {
                loading.value = true;
                const response = await getUserProfile();
                console.log('Profile response:', response);
                profile.value = response;

                if (response.addresses && response.addresses.length > 0) {
                    const userAddress = response.addresses[0];
                    console.log('User address from database:', userAddress);

                    // Cập nhật thông tin địa chỉ cơ bản
                    address.value = {
                        streetNumber: userAddress.streetNumber || '',
                        commune: userAddress.commune || '',
                        district: userAddress.district || '',
                        city: userAddress.city || '',
                        country: userAddress.country || 'Việt Nam',
                        addressType: userAddress.addressType || 1
                    };

                    // Tự động chọn địa chỉ trong các dropdown
                    await autoSelectAddress(userAddress);
                }
            } catch (error) {
                console.error('Error loading profile:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi',
                    text: 'Không thể tải thông tin người dùng'
                });
            } finally {
                loading.value = false;
            }
        };

        // Sửa lại hàm xử lý thay đổi quận/huyện
        const handleDistrictChange = async (district) => {
            try {
                if (district) {
                    console.log('Loading wards for district:', district);
                    wards.value = await getWards(district.code);
                    address.value.district = district.name;
                    selectedWard.value = null;
                    address.value.commune = '';
                } else {
                    wards.value = [];
                    address.value.district = '';
                    address.value.commune = '';
                }
            } catch (error) {
                console.error('Error loading wards:', error);
                wards.value = [];
            }
        };

        // Sửa lại hàm xử lý thay đổi thành phố
        const handleCityChange = async (city) => {
            try {
                if (city) {
                    console.log('Loading districts for city:', city);
                    districts.value = await getDistricts(city.code);
                    address.value.city = city.name;
                    selectedDistrict.value = null;
                    selectedWard.value = null;
                    address.value.district = '';
                    address.value.commune = '';
                } else {
                    districts.value = [];
                    wards.value = [];
                    address.value.city = '';
                    address.value.district = '';
                    address.value.commune = '';
                }
            } catch (error) {
                console.error('Error loading districts:', error);
                districts.value = [];
            }
        };

        // Xử lý cập nhật thông tin
        const updateProfile = async () => {
            try {
                saving.value = true;

                // Kiểm tra đã chọn đủ thông tin địa chỉ chưa
                if (!selectedCity.value || !selectedDistrict.value || !selectedWard.value) {
                    throw new Error('Vui lòng chọn đầy đủ thông tin địa chỉ');
                }

                const updateData = {
                    id: profile.value.id,
                    username: profile.value.username,
                    email: profile.value.email,
                    phone: profile.value.phone,
                    birthday: profile.value.birthday,
                    gender: profile.value.gender,
                    addresses: [{
                        streetNumber: address.value.streetNumber,
                        commune: selectedWard.value.name,
                        district: selectedDistrict.value.name,
                        city: selectedCity.value.name,
                        country: address.value.country,
                        addressType: parseInt(address.value.addressType)
                    }]
                };

                await updateUserProfile(updateData);

                // Reload lại thông tin sau khi cập nhật
                await loadUserProfile();

                Swal.fire({
                    icon: 'success',
                    title: 'Thành công',
                    text: 'Cập nhật thông tin thành công'
                });
            } catch (error) {
                console.error('Error updating profile:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi',
                    text: error.message || 'Không thể cập nhật thông tin'
                });
            } finally {
                saving.value = false;
            }
        };

        // Sửa lại watchers
        watch(selectedCity, async (newCity) => {
            await handleCityChange(newCity);
        });

        watch(selectedDistrict, async (newDistrict) => {
            await handleDistrictChange(newDistrict);
        });

        watch(selectedWard, (newWard) => {
            if (newWard) {
                address.value.commune = newWard.name;
            } else {
                address.value.commune = '';
            }
        });

        onMounted(() => {
            loadUserProfile();
        });

        return {
            loading,
            saving,
            profile,
            address,
            provinces,
            districts,
            wards,
            selectedCity,
            selectedDistrict,
            selectedWard,
            handleCityChange,
            handleDistrictChange,
            updateProfile
        };
    }
};
</script>

<style scoped>
.profile-card {
    border-radius: 1rem;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.profile-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
}

.card-header {
    border-bottom: 1px solid rgba(0, 0, 0, 0.125);
}

.section-title {
    border-bottom: 2px solid #198754;
    padding-bottom: 0.5rem;
}

.form-label {
    font-weight: 500;
    color: #495057;
}

.input-group-text {
    border-right: none;
}

.form-control {
    border-left: none;
}

.form-control:focus {
    box-shadow: none;
    border-color: #ced4da;
}

.form-select {
    border-left: none;
}

.form-select:focus {
    box-shadow: none;
    border-color: #ced4da;
}

.btn-success {
    background-color: #198754;
    border-color: #198754;
    padding: 0.75rem 1.5rem;
    font-weight: 500;
    transition: all 0.3s ease;
}

.btn-success:hover {
    background-color: #157347;
    border-color: #146c43;
    transform: translateY(-2px);
}

.btn-success:disabled {
    background-color: #198754;
    border-color: #198754;
    opacity: 0.65;
}

.invalid-feedback {
    display: block;
    font-size: 0.875rem;
}
</style>