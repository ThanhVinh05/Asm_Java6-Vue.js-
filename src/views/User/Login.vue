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
                        <form @submit.prevent="handleLogin" class="needs-validation" novalidate>
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
import { ref, onMounted } from 'vue';
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
                console.error("Login Error in Component:", error);
                let errorMessage = error.message || 'Vui lòng kiểm tra lại thông tin đăng nhập';
                if (error.response?.data?.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response?.data?.errors) {
                    errors.value = error.response.data.errors;
                    errorMessage = "Thông tin không hợp lệ.";
                }

                Swal.fire({
                    icon: 'error',
                    title: 'Đăng nhập thất bại',
                    text: errorMessage,
                });
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
                const userInfo = await loginWithGoogle(idToken);

                await Swal.fire({
                    icon: 'success',
                    title: 'Đăng nhập Google thành công',
                    text: `Xin chào ${userInfo.username}!`,
                    timer: 1500,
                    showConfirmButton: false
                });
                router.push("/");
            } catch (error) {
                console.error('Google Sign-In Error in Component:', error);
                const googleErrorMessage = error.response?.data?.message || error.message || 'Vui lòng thử lại.';
                Swal.fire({
                    icon: 'error',
                    title: 'Đăng nhập Google thất bại',
                    text: googleErrorMessage,
                });
            } finally {
                isLoading.value = false;
            }
        };

        // Khởi tạo Google Client và Render nút
        const initializeGoogleSignIn = () => {
            if (window.google && window.google.accounts && window.google.accounts.id) {
                try {
                    window.google.accounts.id.initialize({
                        client_id: '750325745930-gvk5ikmvg03dd77d0flac1s05p6pmi3c.apps.googleusercontent.com',
                        callback: handleGoogleCredentialResponse,
                        context: 'signin',
                        ux_mode: 'popup',
                        auto_select: false,
                        itp_support: true
                    });

                    const googleButtonElement = document.getElementById('googleSignInButton');
                    if (googleButtonElement) {
                        if (!googleButtonElement.hasChildNodes()) {
                            window.google.accounts.id.renderButton(
                                googleButtonElement,
                                { theme: "outline", size: "large", type: "standard", text: "signin_with", shape: "rectangular" }
                            );
                        }
                    } else {
                        console.error("Element with id 'googleSignInButton' not found.");
                    }
                } catch (error) {
                    console.error("Error initializing Google Sign-In:", error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Lỗi Khởi Tạo Google Sign-In',
                        text: 'Không thể hiển thị nút đăng nhập Google. Vui lòng tải lại trang hoặc thử lại sau.',
                    });
                }
            } else {
                console.error("Google Identity Services library not loaded or 'id' module missing.");
                setTimeout(initializeGoogleSignIn, 1000);
            }
        };

        onMounted(() => {
            setTimeout(initializeGoogleSignIn, 300);
        });

        return {
            form,
            errors,
            isLoading,
            showPassword,
            rememberMe,
            handleLogin,
        };
    },
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
    background-color: #f8f9fa;
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

.btn-success:hover:not(:disabled) {
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
    color: white;
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

#googleSignInButton {
    min-height: 40px;
}

#googleSignInButton>div {
    margin: auto !important;
}
</style>