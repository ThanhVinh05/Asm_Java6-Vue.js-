<template>
    <div>
        <!-- Top Nav -->
        <nav class="navbar navbar-expand-lg bg-dark navbar-light d-none d-lg-block" id="templatemo_nav_top">
            <div class="container text-light">
                <div class="w-100 d-flex justify-content-between">
                    <div>
                        <a class="navbar-sm-brand text-light text-decoration-none" href="mailto:badminton@company.com">
                            <i class="fa fa-envelope mx-2"></i>badminton@company.com
                        </a>
                        <a class="navbar-sm-brand text-light text-decoration-none" href="tel:010-020-0340">
                            <i class="fa fa-phone mx-2"></i>010-020-0340
                        </a>
                    </div>
                    <div>
                        <a class="text-light" href="#" target="_blank" title="Facebook">
                            <i class="fab fa-facebook-f fa-sm fa-fw me-2"></i>
                        </a>
                        <a class="text-light" href="#" target="_blank" title="Instagram">
                            <i class="fab fa-instagram fa-sm fa-fw me-2"></i>
                        </a>
                        <a class="text-light" href="#" target="_blank" title="Twitter">
                            <i class="fab fa-twitter fa-sm fa-fw me-2"></i>
                        </a>
                        <a class="text-light" href="#" target="_blank" title="Linkedin">
                            <i class="fab fa-linkedin fa-sm fa-fw"></i>
                        </a>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Main Nav -->
        <nav class="navbar navbar-expand-lg navbar-light shadow-sm">
            <div class="container d-flex justify-content-between align-items-center">
                <router-link class="navbar-brand text-success logo h1 align-self-center" to="/">
                    <i class="fa-sharp-duotone fa-thin fa-shuttlecock"></i>Badminton Shop
                </router-link>

                <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse"
                    data-bs-target="#templatemo_main_nav" aria-controls="navbarSupportedContent" aria-expanded="false"
                    aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>

                <div class="align-self-center collapse navbar-collapse flex-fill d-lg-flex justify-content-lg-between"
                    id="templatemo_main_nav">
                    <div class="flex-fill">
                        <ul class="nav navbar-nav d-flex justify-content-between mx-lg-auto">
                            <li class="nav-item">
                                <router-link class="nav-link" to="/">
                                    <i class="fas fa-home me-1"></i>Home
                                </router-link>
                            </li>
                            <li class="nav-item">
                                <router-link class="nav-link" to="/about">
                                    <i class="fas fa-info-circle me-1"></i>About
                                </router-link>
                            </li>
                            <li class="nav-item">
                                <router-link class="nav-link" to="/shop">
                                    <i class="fas fa-store me-1"></i>Shop
                                </router-link>
                            </li>
                            <li class="nav-item" v-if="isAdmin">
                                <router-link class="nav-link" to="/admin">
                                    <i class="fas fa-user-shield me-2"></i>Admin
                                </router-link>
                            </li>
                        </ul>
                    </div>

                    <div class="d-none d-lg-block me-3 ms-5">
                        <div class="input-group">
                            <input type="text" class="form-control" id="navbarSearch" placeholder="Search ..."
                                v-model="searchKeyword" @keyup.enter="performSearch">
                            <button class="btn btn-success text-light" @click="performSearch">
                                <i class="fa fa-fw fa-search"></i>
                            </button>
                        </div>
                    </div>

                    <div class="navbar align-self-center d-flex">
                        <!-- Cart Icon -->
                        <router-link class="nav-icon position-relative text-decoration-none me-3" to="/cart">
                            <i class="fa fa-fw fa-cart-arrow-down text-dark"></i>
                            <span
                                class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                {{ cartCount }}
                            </span>
                        </router-link>

                        <!-- User Dropdown -->
                        <div class="dropdown">
                            <a class="nav-icon position-relative text-decoration-none dropdown-toggle" href="#"
                                id="userDropdown" role="button" data-bs-toggle="dropdown" data-bs-auto-close="true"
                                aria-expanded="false">
                                <i class="fa fa-fw fa-user text-dark"></i>
                                <span v-if="isLoggedIn && userName" class="ms-1">{{ userName }}</span>
                            </a>
                            <ul class="dropdown-menu dropdown-menu-end shadow-sm" aria-labelledby="userDropdown">
                                <template v-if="isLoggedIn">
                                    <li>
                                        <router-link class="dropdown-item" to="/profile">
                                            <i class="fas fa-user me-2"></i>Tài khoản
                                        </router-link>
                                    </li>
                                    <li>
                                        <router-link class="dropdown-item" to="/orders">
                                            <i class="fas fa-shopping-bag me-2"></i>Đơn hàng
                                        </router-link>
                                    </li>
                                    <li v-if="isAdmin">
                                        <router-link class="dropdown-item" to="/admin">
                                            <i class="fas fa-user-shield me-2"></i>Quản lý
                                        </router-link>
                                    </li>
                                    <li>
                                        <hr class="dropdown-divider">
                                    </li>
                                    <li>
                                        <button class="dropdown-item" @click="handleLogout">
                                            <i class="fas fa-sign-out-alt me-2"></i>Đăng xuất
                                        </button>
                                    </li>
                                </template>
                                <template v-else>
                                    <li>
                                        <router-link class="dropdown-item" to="/login">
                                            <i class="fas fa-sign-in-alt me-2"></i>Đăng nhập
                                        </router-link>
                                    </li>
                                    <li>
                                        <router-link class="dropdown-item" to="/register">
                                            <i class="fas fa-user-plus me-2"></i>Đăng ký
                                        </router-link>
                                    </li>
                                </template>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { logout } from "/src/api/user";
import { tokenService } from '/src/utils/tokenService';
import { userStore } from '/src/store/userStore';
import { cartStore } from '/src/store/cartStore';
import Swal from 'sweetalert2';

export default {
    setup() {
        const router = useRouter();
        const store = useStore();
        const searchKeyword = ref("");
        const cartCount = computed(() => cartStore.cartCount.value);

        // Computed properties from Vuex store
        const userName = computed(() => store.getters['auth/currentUser']?.username);
        const isLoggedIn = computed(() => store.getters['auth/isAuthenticated']);
        const isAdmin = computed(() => store.getters['auth/isAdmin']);

        const handleLogout = async () => {
            try {
                await logout();
                await store.dispatch('auth/logout');
                cartStore.resetCart();

                await Swal.fire({
                    icon: 'success',
                    title: 'Đăng xuất thành công',
                    showConfirmButton: false,
                    timer: 1500
                });

                router.push('/login');
            } catch (error) {
                console.error('Logout failed:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Đăng xuất thất bại',
                    text: 'Vui lòng thử lại sau'
                });
            }
        };

        const performSearch = () => {
            if (searchKeyword.value.trim()) {
                router.push({
                    name: 'shop',
                    query: { keyword: searchKeyword.value.trim() }
                });
            }
        };

        return {
            searchKeyword,
            cartCount,
            userName,
            isLoggedIn,
            isAdmin,
            handleLogout,
            performSearch
        };
    }
};
</script>

<style scoped>
.navbar {
    padding: 1rem 0;
}

.navbar-brand {
    font-size: 1.5rem;
    font-weight: 700;
}

.nav-link {
    font-weight: 500;
    padding: 0.5rem 1rem;
    transition: color 0.2s;
}

.nav-link:hover {
    color: #198754 !important;
}

.nav-icon {
    font-size: 1.25rem;
    padding: 0.5rem;
    transition: transform 0.2s;
}

.nav-icon:hover {
    transform: translateY(-2px);
}

.dropdown-menu {
    border: none;
    border-radius: 0.5rem;
    padding: 0.5rem;
}

.dropdown-item {
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    transition: background-color 0.2s;
}

.dropdown-item:hover {
    background-color: #f8f9fa;
}

.badge {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
}

.input-group .form-control {
    border-right: none;
}

.input-group .btn {
    border-left: none;
}

.input-group .form-control:focus {
    box-shadow: none;
    border-color: #ced4da;
}

@media (max-width: 991.98px) {
    .navbar-collapse {
        background-color: white;
        padding: 1rem;
        border-radius: 0.5rem;
        box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    }
}
</style>