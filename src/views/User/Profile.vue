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
                                    <button type="button" class="btn btn-sm btn-outline-secondary ms-2"
                                        title="Cập nhật lại chọn địa chỉ" @click="forceUpdateSelects">
                                        <i class="fas fa-sync-alt"></i>
                                    </button>
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
                                            <option v-for="province in provinces" :key="province.code" :value="province"
                                                :selected="selectedCity && selectedCity.code === province.code">
                                                {{ province.displayName || province.name }}
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
                                            <option v-for="district in districts" :key="district.code" :value="district"
                                                :selected="selectedDistrict && selectedDistrict.code === district.code">
                                                {{ district.displayName || district.name }}
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
                                            <option v-for="ward in wards" :key="ward.code" :value="ward"
                                                :selected="selectedWard && selectedWard.code === ward.code">
                                                {{ ward.displayName || ward.name }}
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
import { getUserProfile, updateUserProfile } from '../../api/user';
import { getProvinces, getDistricts, getWards } from '../../api/address';
import Swal from 'sweetalert2';

// Helper function để chuẩn hóa tên địa chỉ
const normalizeName = (name) => {
    if (!name) return '';
    // Loại bỏ các tiền tố phổ biến trước khi so sánh
    let normalizedName = name.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .trim();

    // Loại bỏ các tiền tố để so sánh chính xác hơn
    const prefixes = ['tinh ', 'thanh pho ', 'quan ', 'huyen ', 'phuong ', 'xa ', 'thi xa ', 'thi tran '];
    prefixes.forEach(prefix => {
        if (normalizedName.startsWith(prefix)) {
            normalizedName = normalizedName.substring(prefix.length);
        }
    });

    return normalizedName;
};

// Helper function để tìm địa chỉ phù hợp
const findMatchingAddress = (list, searchName) => {
    console.log('Searching for:', searchName, 'in list of', list.length, 'items');
    const normalizedSearch = normalizeName(searchName);

    // Log first few items from list for debugging
    if (list.length > 0) {
        console.log('First item in list:', list[0]);
    }

    // 1. Try exact match (case insensitive)
    let found = list.find(item => {
        const itemName = normalizeName(item.name);
        const exactMatch = itemName === normalizedSearch;
        if (exactMatch) console.log('Exact match found for', searchName, ':', item.name);
        return exactMatch;
    });

    // 2. Try exact match with displayName
    if (!found && list[0]?.displayName) {
        found = list.find(item => {
            const itemDisplayName = normalizeName(item.displayName);
            const exactMatch = itemDisplayName === normalizedSearch;
            if (exactMatch) console.log('Exact match found with displayName for', searchName, ':', item.displayName);
            return exactMatch;
        });
    }

    // 3. Try contains match
    if (!found) {
        found = list.find(item => {
            const itemName = normalizeName(item.name);
            const containsMatch = itemName.includes(normalizedSearch) || normalizedSearch.includes(itemName);
            if (containsMatch) console.log('Contains match found for', searchName, ':', item.name);
            return containsMatch;
        });
    }

    // 4. Try contains match with displayName
    if (!found && list[0]?.displayName) {
        found = list.find(item => {
            const itemDisplayName = normalizeName(item.displayName);
            const containsMatch = itemDisplayName.includes(normalizedSearch) || normalizedSearch.includes(itemDisplayName);
            if (containsMatch) console.log('Contains match found with displayName for', searchName, ':', item.displayName);
            return containsMatch;
        });
    }

    // 5. Special cases for HCM, Hanoi
    if (!found) {
        const specialCases = {
            'ho chi minh': ['ho chi minh', 'hcm', 'tphcm'],
            'ha noi': ['ha noi', 'hanoi']
        };

        for (const [key, variants] of Object.entries(specialCases)) {
            if (variants.some(v => normalizedSearch.includes(v) || v.includes(normalizedSearch))) {
                found = list.find(item => {
                    const normalizedItemName = normalizeName(item.name);
                    return normalizedItemName.includes(key) || key.includes(normalizedItemName);
                });
                if (found) {
                    console.log('Special case match found for', searchName, ':', found.name);
                    break;
                }
            }
        }
    }

    if (!found) {
        console.log('No match found for', searchName);
    }

    return found;
};

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

        // Hàm tự động chọn địa chỉ dựa trên dữ liệu từ database
        const autoSelectAddress = async (userAddress) => {
            try {
                console.log('Starting address selection with:', userAddress);

                // 1. Load tất cả tỉnh/thành phố
                provinces.value = await getProvinces();
                console.log('Loaded provinces:', provinces.value.length);

                // 2. Tìm và chọn thành phố
                const cityName = userAddress.city?.trim();
                console.log('Looking for city:', cityName);

                if (!cityName) {
                    console.log('No city name provided');
                    return;
                }

                // Tìm thành phố
                const foundCity = findMatchingAddress(provinces.value, cityName);

                if (foundCity) {
                    console.log('Found matching city:', foundCity);

                    // Set the selected city AFTER loading its districts
                    const districtList = await getDistricts(foundCity.code);
                    districts.value = districtList;
                    console.log('Loaded districts:', districts.value.length);

                    // Now set the city to trigger UI update
                    selectedCity.value = foundCity;
                    address.value.city = foundCity.displayName || foundCity.name;

                    // Tìm quận/huyện
                    const districtName = userAddress.district?.trim();
                    console.log('Looking for district:', districtName);

                    if (!districtName) {
                        console.log('No district name provided');
                        return;
                    }

                    const foundDistrict = findMatchingAddress(districts.value, districtName);

                    if (foundDistrict) {
                        console.log('Found matching district:', foundDistrict);

                        // Load wards before setting the selected district
                        const wardList = await getWards(foundDistrict.code);
                        wards.value = wardList;
                        console.log('Loaded wards:', wards.value.length);

                        // Now set the district to trigger UI update
                        selectedDistrict.value = foundDistrict;
                        address.value.district = foundDistrict.displayName || foundDistrict.name;

                        // Tìm phường/xã
                        const wardName = userAddress.commune?.trim();
                        console.log('Looking for ward:', wardName);

                        if (!wardName) {
                            console.log('No ward name provided');
                            return;
                        }

                        const foundWard = findMatchingAddress(wards.value, wardName);

                        if (foundWard) {
                            console.log('Found matching ward:', foundWard);

                            // Set the ward and update the UI
                            selectedWard.value = foundWard;
                            address.value.commune = foundWard.displayName || foundWard.name;

                            console.log('Address selection complete with values:');
                            console.log('City:', selectedCity.value?.displayName || selectedCity.value?.name);
                            console.log('District:', selectedDistrict.value?.displayName || selectedDistrict.value?.name);
                            console.log('Ward:', selectedWard.value?.displayName || selectedWard.value?.name);

                            // Ensure elements are updated in the DOM
                            setTimeout(() => {
                                forceUpdateSelects();
                            }, 100);
                        } else {
                            console.log('Ward not found:', wardName);
                        }
                    } else {
                        console.log('District not found:', districtName);
                    }
                } else {
                    console.log('City not found:', cityName);
                }
            } catch (error) {
                console.error('Error in autoSelectAddress:', error);
            }
        };

        // Hàm để cập nhật trực tiếp các dropdown
        const forceUpdateSelects = () => {
            try {
                console.log('Forcing update of select elements');

                // Cập nhật select box tỉnh/thành phố
                if (selectedCity.value) {
                    const provinceSelect = document.getElementById('province');
                    if (provinceSelect) {
                        const options = provinceSelect.options;
                        for (let i = 0; i < options.length; i++) {
                            if (options[i].text.includes(selectedCity.value.name)) {
                                provinceSelect.selectedIndex = i;
                                break;
                            }
                        }
                    }
                }

                // Cập nhật select box quận/huyện
                if (selectedDistrict.value) {
                    const districtSelect = document.getElementById('district');
                    if (districtSelect) {
                        const options = districtSelect.options;
                        for (let i = 0; i < options.length; i++) {
                            if (options[i].text.includes(selectedDistrict.value.name)) {
                                districtSelect.selectedIndex = i;
                                break;
                            }
                        }
                    }
                }

                // Cập nhật select box phường/xã
                if (selectedWard.value) {
                    const wardSelect = document.getElementById('ward');
                    if (wardSelect) {
                        const options = wardSelect.options;
                        for (let i = 0; i < options.length; i++) {
                            if (options[i].text.includes(selectedWard.value.name)) {
                                wardSelect.selectedIndex = i;
                                break;
                            }
                        }
                    }
                }

                console.log('Select elements updated');
            } catch (error) {
                console.error('Error updating select elements:', error);
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

                    // Kiểm tra xem địa chỉ có thông tin không
                    if (!userAddress.city || !userAddress.district || !userAddress.commune) {
                        console.log('Address data incomplete:', userAddress);
                        loading.value = false;
                        return;
                    }

                    // Cập nhật thông tin địa chỉ cơ bản
                    address.value = {
                        streetNumber: userAddress.streetNumber || '',
                        commune: userAddress.commune || '',
                        district: userAddress.district || '',
                        city: userAddress.city || '',
                        country: userAddress.country || 'Việt Nam',
                        addressType: userAddress.addressType || 1
                    };

                    console.log('Updated address object:', address.value);

                    // Tự động chọn địa chỉ trong các dropdown
                    await autoSelectAddress(userAddress);
                } else {
                    console.log('No address found in user profile');
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
                    address.value.district = district.displayName || district.name;
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

        // Sửa lại hàm xử lý thay đổi tỉnh/thành phố
        const handleCityChange = async (city) => {
            try {
                if (city) {
                    console.log('Loading districts for city:', city);
                    districts.value = await getDistricts(city.code);
                    address.value.city = city.displayName || city.name;
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
                        commune: selectedWard.value.displayName || selectedWard.value.name,
                        district: selectedDistrict.value.displayName || selectedDistrict.value.name,
                        city: selectedCity.value.displayName || selectedCity.value.name,
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
            if (newCity) {
                console.log('City changed:', newCity);
            }
            await handleCityChange(newCity);
        });

        watch(selectedDistrict, async (newDistrict) => {
            if (newDistrict) {
                console.log('District changed:', newDistrict);
            }
            await handleDistrictChange(newDistrict);
        });

        watch(selectedWard, (newWard) => {
            if (newWard) {
                console.log('Ward changed:', newWard);
                address.value.commune = newWard.displayName || newWard.name;
            } else {
                address.value.commune = '';
            }
        });

        onMounted(async () => {
            try {
                console.log('Profile component mounted');
                await loadUserProfile();

                // Double-check that UI is updated with selected values
                console.log('After loading, selected values are:');
                console.log('City:', selectedCity.value);
                console.log('District:', selectedDistrict.value);
                console.log('Ward:', selectedWard.value);

                // Force UI update if needed
                setTimeout(() => {
                    if (selectedCity.value && selectedDistrict.value && selectedWard.value) {
                        console.log('Forcing UI update with selected values');
                        forceUpdateSelects();
                    }
                }, 500);
            } catch (error) {
                console.error('Error in onMounted:', error);
            }
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
            updateProfile,
            forceUpdateSelects
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