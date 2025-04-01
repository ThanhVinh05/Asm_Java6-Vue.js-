<template>
    <div>
        <!-- Start Top Nav -->
        <nav class="navbar navbar-expand-lg bg-dark navbar-light d-none d-lg-block" id="templatemo_nav_top">
            <div class="container text-light">
                <div class="w-100 d-flex justify-content-between">
                    <div>
                        <i class="fa fa-envelope mx-2"></i>
                        <a class="navbar-sm-brand text-light text-decoration-none" href="#">badminton@company.com</a>
                        <i class="fa fa-phone mx-2"></i>
                        <a class="navbar-sm-brand text-light text-decoration-none" href="#">010-020-0340</a>
                    </div>
                    <div>
                        <a class="text-light" href="#" target="_blank" rel="sponsored"><i
                                class="fab fa-facebook-f fa-sm fa-fw me-2"></i></a>
                        <a class="text-light" href="#" target="_blank"><i
                                class="fab fa-instagram fa-sm fa-fw me-2"></i></a>
                        <a class="text-light" href="#" target="_blank"><i
                                class="fab fa-twitter fa-sm fa-fw me-2"></i></a>
                        <a class="text-light" href="#" target="_blank"><i class="fab fa-linkedin fa-sm fa-fw"></i></a>
                    </div>
                </div>
            </div>
        </nav>
        <!-- Close Top Nav -->

        <!-- Header -->
        <nav class="navbar navbar-expand-lg navbar-light shadow">
            <div class="container d-flex justify-content-between align-items-center">
                <a class="navbar-brand text-success logo h1 align-self-center" href="index.html">
                    Badminton Shop
                </a>

                <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse"
                    data-bs-target="#templatemo_main_nav" aria-controls="navbarSupportedContent" aria-expanded="false"
                    aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>

                <div class="align-self-center collapse navbar-collapse flex-fill d-lg-flex justify-content-lg-between"
                    id="templatemo_main_nav">
                    <div class="flex-fill">
                        <ul class="nav navbar-nav d-flex justify-content-between mx-lg-auto">
                            <li class="nav-item"><router-link class="nav-link" to="/">Home</router-link></li>
                            <li class="nav-item"><router-link class="nav-link" to="/about">About</router-link></li>
                            <li class="nav-item"><router-link class="nav-link" to="/shop">Shop</router-link></li>
                            <li class="nav-item"><router-link class="nav-link" to="/productDetail">Contact</router-link>
                            </li>
                        </ul>
                    </div>

                    <div class="d-none d-lg-block me-3 ms-5">
                        <div class="input-group">
                            <input type="text" class="form-control" id="navbarSearch" placeholder="Search ..."
                                v-model="searchKeyword">
                            <button class="input-group-text bg-success text-light" @click="performSearch">
                                <i class="fa fa-fw fa-search text-white"></i>
                            </button>
                        </div>
                    </div>

                    <div class="navbar align-self-center d-flex justify-content-between">
                        <a class="nav-icon position-relative text-decoration-none" href="#">
                            <i class="fa fa-fw fa-cart-arrow-down text-dark mr-1"></i>
                            <span
                                class="position-absolute top-0 left-100 translate-middle badge rounded-pill bg-light text-dark">7</span>
                        </a>
                        <a class="nav-icon position-relative text-decoration-none" href="#">
                            <i class="fa fa-fw fa-user text-dark mr-3"></i>
                            <span
                                class="position-absolute top-0 left-100 translate-middle badge rounded-pill bg-light text-dark">+99</span>
                        </a>
                    </div>
                </div>
            </div>
        </nav>
        <!-- Close Header -->
    </div>
</template>
<script>
export default {
    data() {
        return {
            searchKeyword: ''
        };
    },
    methods: {
        performSearch() {
            if (this.searchKeyword) {
                this.$router.push({ name: 'shop', query: { keyword: this.searchKeyword } });
            } else {
                this.$router.push({ name: 'shop' }); // Nếu không có từ khóa, chuyển đến trang shop mà không có query
            }
        }
    }
};
</script>