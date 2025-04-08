<template>
    <div class="container py-5">
        <div class="row justify-content-center">
            <div class="col-md-6 col-lg-5">
                <div class="card border-0 shadow-sm login-card">
                    <div class="card-header bg-white border-0 py-4">
                        <h4 class="text-center mb-0">
                            <i class="fas fa-sign-in-alt me-2 text-success"></i>
                            Đăng nhập
                        </h4>
                    </div>
                    <div class="card-body p-4">
                        <form @submit.prevent="login" class="needs-validation" novalidate>
                            <div class="mb-4">
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

                            <div class="mb-4">
                                <label for="password" class="form-label">Mật khẩu</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-light">
                                        <i class="fas fa-lock text-success"></i>
                                    </span>
                                    <input :type="showPassword ? 'text' : 'password'" class="form-control" id="password"
                                        v-model="form.password" :class="{ 'is-invalid': errors.password }" required />
                                    <button class="btn btn-outline-secondary" type="button"
                                        @click="showPassword = !showPassword">
                                        <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                                    </button>
                                </div>
                                <div class="invalid-feedback" v-if="errors.password">
                                    {{ errors.password }}
                                </div>
                            </div>

                            <div class="mb-4 form-check">
                                <input type="checkbox" class="form-check-input" id="rememberMe" v-model="rememberMe">
                                <label class="form-check-label" for="rememberMe">Ghi nhớ đăng nhập</label>
                            </div>

                            <div class="d-grid gap-2">
                                <button type="submit" class="btn btn-success" :disabled="isLoading">
                                    <span v-if="isLoading">
                                        <span class="spinner-border spinner-border-sm" role="status"
                                            aria-hidden="true"></span>
                                        Đang đăng nhập...
                                    </span>
                                    <span v-else>
                                        <i class="fas fa-sign-in-alt me-2"></i>Đăng nhập
                                    </span>
                                </button>

                                <button type="button" class="btn btn-outline-danger" @click="handleGoogleLogin">
                                    <i class="fab fa-google me-2"></i>Đăng nhập bằng Google
                                </button>

                                <router-link to="/register" class="btn btn-outline-success">
                                    <i class="fas fa-user-plus me-2"></i>Chưa có tài khoản? Đăng ký ngay
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
import { login, loginWithGoogle } from "/src/api/user";
import Swal from 'sweetalert2';
import { userStore } from '../store/userStore';
import { logout } from "/src/api/user";
import { cartStore } from '../store/cartStore';
import { useRouter } from 'vue-router';

export default {
    setup() {
        const router = useRouter();

        const handleLogout = async () => {
            try {
                await logout();
                cartStore.resetCart();
                router.push('/login');
            } catch (error) {
                console.error('Logout failed:', error);
            }
        };

        return {
            handleLogout
        };
    },
    data() {
        return {
            form: {
                username: "",
                password: "",
            },
            errors: {},
            isLoading: false,
            showPassword: false,
            rememberMe: false
        };
    },
    methods: {
        async login() {
            this.errors = {};
            this.isLoading = true;

            try {
                const user = await login(this.form);

                // Cập nhật trạng thái người dùng ngay sau khi đăng nhập thành công
                userStore.setUserInfo(user.username, user.role);

                // Hiển thị thông báo thành công
                await Swal.fire({
                    icon: 'success',
                    title: 'Đăng nhập thành công',
                    text: `Xin chào ${user.username}!`,
                    timer: 1500,
                    showConfirmButton: false
                });

                // Chuyển hướng về trang chủ
                this.$router.push("/");
            } catch (error) {
                // Xử lý lỗi
                if (error.response?.data?.errors) {
                    this.errors = error.response.data.errors;
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Đăng nhập thất bại',
                        text: error.message || 'Vui lòng kiểm tra lại thông tin đăng nhập',
                    });
                }
            } finally {
                this.isLoading = false;
            }
        },

        async handleGoogleLogin() {
            try {
                // Load the Google API Client
                await this.loadGoogleAPI();

                // Initialize Google Sign-In
                const auth2 = window.gapi.auth2.getAuthInstance();
                const googleUser = await auth2.signIn();

                // Get the ID token
                const idToken = googleUser.getAuthResponse().id_token;

                // Send token to backend
                const user = await loginWithGoogle(idToken);

                // Show success message
                await Swal.fire({
                    icon: 'success',
                    title: 'Đăng nhập thành công',
                    text: `Xin chào ${user.username}!`,
                    timer: 1500,
                    showConfirmButton: false
                });

                // Redirect to home page
                this.$router.push("/");
            } catch (error) {
                console.error('Google login error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Đăng nhập thất bại',
                    text: error.message || 'Không thể đăng nhập bằng Google. Vui lòng thử lại sau.'
                });
            }
        },

        loadGoogleAPI() {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://apis.google.com/js/platform.js';
                script.onload = () => {
                    window.gapi.load('auth2', () => {
                        window.gapi.auth2.init({
                            client_id: 'YOUR_GOOGLE_CLIENT_ID', // Replace with your Google Client ID
                        }).then(resolve).catch(reject);
                    });
                };
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }
    }
};
</script>

<style scoped>
.login-card {
    border-radius: 1rem;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.login-card:hover {
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

.form-check-input:checked {
    background-color: #198754;
    border-color: #198754;
}

.invalid-feedback {
    display: block;
    font-size: 0.875rem;
}

.btn-outline-danger {
    margin-top: 1rem;
    padding: 0.75rem 1.5rem;
    font-weight: 500;
    transition: all 0.3s ease;
}

.btn-outline-danger:hover {
    background-color: #dc3545;
    border-color: #dc3545;
    color: white;
    transform: translateY(-2px);
}
</style>