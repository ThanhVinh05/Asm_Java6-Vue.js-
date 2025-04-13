<template>
    <div class="container py-5">
        <div class="row justify-content-center">
            <div class="col-md-8 col-lg-6">
                <div class="card border-0 shadow-sm register-card">
                    <div class="card-header bg-white border-0 py-4">
                        <h4 class="text-center mb-0">
                            <i class="fas fa-user-plus me-2 text-success"></i>
                            Đăng ký tài khoản
                        </h4>
                    </div>
                    <div class="card-body p-4">
                        <form @submit.prevent="register" class="needs-validation" novalidate>
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label for="username" class="form-label">Tên đăng nhập</label>
                                    <div class="input-group">
                                        <span class="input-group-text bg-light">
                                            <i class="fas fa-user text-success"></i>
                                        </span>
                                        <input type="text" class="form-control" id="username" v-model="form.username"
                                            :class="{ 'is-invalid': errors.username }" required />
                                    </div>
                                    <div class="invalid-feedback" v-if="errors.username">
                                        {{ errors.username }}
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <label for="email" class="form-label">Email</label>
                                    <div class="input-group">
                                        <span class="input-group-text bg-light">
                                            <i class="fas fa-envelope text-success"></i>
                                        </span>
                                        <input type="email" class="form-control" id="email" v-model="form.email"
                                            :class="{ 'is-invalid': errors.email }" required />
                                    </div>
                                    <div class="invalid-feedback" v-if="errors.email">
                                        {{ errors.email }}
                                    </div>
                                </div>
                            </div>

                            <div class="row g-3 mt-2">
                                <div class="col-md-6">
                                    <label for="password" class="form-label">Mật khẩu</label>
                                    <div class="input-group">
                                        <span class="input-group-text bg-light">
                                            <i class="fas fa-lock text-success"></i>
                                        </span>
                                        <input :type="showPassword ? 'text' : 'password'" class="form-control"
                                            id="password" v-model="form.password"
                                            :class="{ 'is-invalid': errors.password }" required />
                                        <button class="btn btn-outline-secondary" type="button"
                                            @click="showPassword = !showPassword">
                                            <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                                        </button>
                                    </div>
                                    <div class="invalid-feedback" v-if="errors.password">
                                        {{ errors.password }}
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <label for="confirmPassword" class="form-label">Xác nhận mật khẩu</label>
                                    <div class="input-group">
                                        <span class="input-group-text bg-light">
                                            <i class="fas fa-lock text-success"></i>
                                        </span>
                                        <input type="password" class="form-control" id="confirmPassword"
                                            v-model="form.confirmPassword"
                                            :class="{ 'is-invalid': errors.confirmPassword }" required />
                                    </div>
                                    <div class="invalid-feedback" v-if="errors.confirmPassword">
                                        {{ errors.confirmPassword }}
                                    </div>
                                </div>
                            </div>

                            <div class="row g-3 mt-2">
                                <div class="col-md-6">
                                    <label for="phone" class="form-label">Số điện thoại</label>
                                    <div class="input-group">
                                        <span class="input-group-text bg-light">
                                            <i class="fas fa-phone text-success"></i>
                                        </span>
                                        <input type="text" class="form-control" id="phone" v-model="form.phone"
                                            :class="{ 'is-invalid': errors.phone }" required />
                                    </div>
                                    <div class="invalid-feedback" v-if="errors.phone">
                                        {{ errors.phone }}
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <label for="birthday" class="form-label">Ngày sinh</label>
                                    <div class="input-group">
                                        <span class="input-group-text bg-light">
                                            <i class="fas fa-calendar text-success"></i>
                                        </span>
                                        <input type="date" class="form-control" id="birthday" v-model="form.birthday"
                                            :class="{ 'is-invalid': errors.birthday }" />
                                    </div>
                                    <div class="invalid-feedback" v-if="errors.birthday">
                                        {{ errors.birthday }}
                                    </div>
                                </div>
                            </div>

                            <div class="mb-3 mt-2">
                                <label for="gender" class="form-label">Giới tính</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-light">
                                        <i class="fas fa-venus-mars text-success"></i>
                                    </span>
                                    <select class="form-select" id="gender" v-model="form.gender"
                                        :class="{ 'is-invalid': errors.gender }" required>
                                        <option value="">Chọn giới tính</option>
                                        <option value="MALE">Nam</option>
                                        <option value="FEMALE">Nữ</option>
                                        <option value="OTHER">Khác</option>
                                    </select>
                                </div>
                                <div class="invalid-feedback" v-if="errors.gender">
                                    {{ errors.gender }}
                                </div>
                            </div>

                            <div class="d-grid gap-2 mt-4">
                                <button type="submit" class="btn btn-success" :disabled="isLoading">
                                    <span v-if="isLoading">
                                        <span class="spinner-border spinner-border-sm" role="status"
                                            aria-hidden="true"></span>
                                        Đang đăng ký...
                                    </span>
                                    <span v-else>
                                        <i class="fas fa-user-plus me-2"></i>Đăng ký
                                    </span>
                                </button>
                                <router-link to="/login" class="btn btn-outline-success">
                                    <i class="fas fa-sign-in-alt me-2"></i>Đã có tài khoản? Đăng nhập ngay
                                </router-link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { register } from '/src/api/user';
import Swal from 'sweetalert2';

export default {
    data() {
        return {
            form: {
                username: '',
                email: '',
                password: '',
                confirmPassword: '',
                phone: '',
                birthday: '',
                gender: '',
            },
            errors: {},
            isLoading: false,
            showPassword: false
        };
    },
    methods: {
        validateForm() {
            this.errors = {};
            let isValid = true;

            // Validate username
            if (!this.form.username) {
                this.errors.username = 'Vui lòng nhập tên đăng nhập';
                isValid = false;
            }

            // Validate email
            if (!this.form.email) {
                this.errors.email = 'Vui lòng nhập email';
                isValid = false;
            } else if (!this.isValidEmail(this.form.email)) {
                this.errors.email = 'Email không hợp lệ';
                isValid = false;
            }

            // Validate password
            if (!this.form.password) {
                this.errors.password = 'Vui lòng nhập mật khẩu';
                isValid = false;
            } else if (this.form.password.length < 6) {
                this.errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
                isValid = false;
            }

            // Validate confirm password
            if (this.form.password !== this.form.confirmPassword) {
                this.errors.confirmPassword = 'Mật khẩu không khớp';
                isValid = false;
            }

            // Validate phone
            if (!this.form.phone) {
                this.errors.phone = 'Vui lòng nhập số điện thoại';
                isValid = false;
            } else if (!this.isValidPhone(this.form.phone)) {
                this.errors.phone = 'Số điện thoại không hợp lệ';
                isValid = false;
            }

            // Validate gender
            if (!this.form.gender) {
                this.errors.gender = 'Vui lòng chọn giới tính';
                isValid = false;
            }

            return isValid;
        },
        isValidEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        },
        isValidPhone(phone) {
            const re = /^[0-9]{10,11}$/;
            return re.test(phone);
        },
        async register() {
            if (!this.validateForm()) return;

            this.isLoading = true;
            try {
                // Gửi request đăng ký
                const { data } = await register({
                    username: this.form.username,
                    email: this.form.email,
                    password: this.form.password,
                    phone: this.form.phone,
                    birthday: this.form.birthday,
                    gender: this.form.gender
                });

                // Hiển thị thông báo thành công và hướng dẫn xác nhận email
                await Swal.fire({
                    icon: 'success',
                    title: 'Đăng ký thành công!',
                    html: `
                        <p>Vui lòng kiểm tra email <strong>${this.form.email}</strong> để xác nhận tài khoản.</p>
                        <p>Sau khi xác nhận, bạn có thể đăng nhập vào hệ thống.</p>
                    `,
                    confirmButtonText: 'OK'
                });

                // Reset form
                this.form = {
                    username: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    phone: '',
                    birthday: '',
                    gender: ''
                };
            } catch (error) {
                if (error.response?.data?.errors) {
                    this.errors = error.response.data.errors;
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Đăng ký thất bại',
                        text: error.message || 'Vui lòng thử lại sau',
                    });
                }
            } finally {
                this.isLoading = false;
            }
        }
    }
};
</script>

<style scoped>
.register-card {
    border-radius: 1rem;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.register-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
}

.card-header {
    border-bottom: 1px solid rgba(0, 0, 0, 0.125);
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

.btn-outline-success {
    color: #198754;
    border-color: #198754;
    padding: 0.75rem 1.5rem;
    font-weight: 500;
    transition: all 0.3s ease;
}

.btn-outline-success:hover {
    background-color: #198754;
    border-color: #198754;
    transform: translateY(-2px);
}

.invalid-feedback {
    display: block;
    font-size: 0.875rem;
}
</style>