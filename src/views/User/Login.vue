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

                                <!-- Google Sign-In Button Placeholder -->
                                <div id="googleSignInButton" class="mt-3 d-flex justify-content-center"></div>

                                <hr class="my-3">

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
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { login, loginWithGoogle } from "/src/api/user";
import Swal from 'sweetalert2';
import { userStore } from '../../store/userStore';
import { tokenService } from '../../utils/tokenService';
import { cartStore } from '../../store/cartStore';

export default {
    setup() {
        const router = useRouter();
        const form = ref({ username: "", password: "" });
        const errors = ref({});
        const isLoading = ref(false);
        const showPassword = ref(false);
        const rememberMe = ref(false);

        const handleLogin = async () => {
            errors.value = {};
            isLoading.value = true;
            try {
                const user = await login(form.value);
                tokenService.setToken(user.accessToken);
                userStore.setUserInfo(user.username, user.role);
                await cartStore.initializeCart();

                await Swal.fire({
                    icon: 'success',
                    title: 'Đăng nhập thành công',
                    text: `Xin chào ${user.username}!`,
                    timer: 1500,
                    showConfirmButton: false
                });
                router.push("/");
            } catch (error) {
                if (error.response?.data?.errors) {
                    errors.value = error.response.data.errors;
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Đăng nhập thất bại',
                        text: error.message || 'Vui lòng kiểm tra lại thông tin đăng nhập',
                    });
                }
            } finally {
                isLoading.value = false;
            }
        };

        // Hàm xử lý callback từ Google
        const handleGoogleCredentialResponse = async (response) => {
            console.log("Received Google Credential:", response);
            isLoading.value = true;
            try {
                const idToken = response.credential;
                // Gọi API backend với ID token
                const userInfo = await loginWithGoogle(idToken);

                // Không cần lưu token ở đây vì loginWithGoogle đã làm
                // Không cần cập nhật userStore vì loginWithGoogle đã làm
                // Không cần initializeCart vì loginWithGoogle đã làm

                await Swal.fire({
                    icon: 'success',
                    title: 'Đăng nhập Google thành công',
                    text: `Xin chào ${userInfo.username}!`,
                    timer: 1500,
                    showConfirmButton: false
                });
                router.push("/");
            } catch (error) {
                console.error('Google Sign-In Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Đăng nhập Google thất bại',
                    text: error.message || 'Vui lòng thử lại.',
                });
            } finally {
                isLoading.value = false;
            }
        };

        // Khởi tạo Google Client và Render nút
        const initializeGoogleSignIn = () => {
            if (window.google && window.google.accounts) {
                try {
                    window.google.accounts.id.initialize({
                        client_id: '750325745930-gvk5ikmvg03dd77d0flac1s05p6pmi3c.apps.googleusercontent.com', // **QUAN TRỌNG: Thay YOUR_GOOGLE_CLIENT_ID bằng Client ID thật của bạn**
                        callback: handleGoogleCredentialResponse,
                        context: 'signin',
                        ux_mode: 'popup',
                        auto_select: false, // Hoặc true nếu muốn tự động chọn tài khoản đã đăng nhập trước đó
                        itp_support: true
                    });

                    const googleButtonElement = document.getElementById('googleSignInButton');
                    if (googleButtonElement) {
                        window.google.accounts.id.renderButton(
                            googleButtonElement,
                            { theme: "outline", size: "large", type: "standard", text: "signin_with", shape: "rectangular" } // Tùy chỉnh giao diện nút
                        );
                    } else {
                        console.error("Element with id 'googleSignInButton' not found.");
                    }
                    // google.accounts.id.prompt(); // Hiển thị One Tap prompt nếu muốn
                } catch (error) {
                    console.error("Error initializing Google Sign-In:", error);
                }
            } else {
                console.error("Google Identity Services library not loaded.");
                // Có thể thử lại sau một khoảng thời gian ngắn
                // setTimeout(initializeGoogleSignIn, 500);
            }
        };

        onMounted(() => {
            // Đảm bảo thư viện Google đã tải xong trước khi khởi tạo
            if (window.google) {
                initializeGoogleSignIn();
            } else {
                // Nếu chưa tải xong, đợi sự kiện tải xong của script
                const checkGoogleInterval = setInterval(() => {
                    if (window.google && window.google.accounts) {
                        clearInterval(checkGoogleInterval);
                        initializeGoogleSignIn();
                    }
                }, 100);
            }
        });

        return {
            form,
            errors,
            isLoading,
            showPassword,
            rememberMe,
            login: handleLogin,
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

#googleSignInButton>div {
    margin: auto !important;
    /* Căn giữa nút Google */
}
</style>