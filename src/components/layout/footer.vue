<template>
    <!-- Start Footer -->
    <footer class="bg-dark" id="tempaltemo_footer">
        <div class="container">
            <div class="row">

                <div class="col-md-4 pt-5">
                    <h2 class="h2 text-success border-bottom pb-3 border-light logo">Badminton Shop</h2>
                    <ul class="list-unstyled text-light footer-link-list">
                        <li>
                            <i class="fas fa-map-marker-alt fa-fw"></i>
                            Tân Chánh Hiệp, Quận 12, Tp Hồ Chí Minh
                        </li>
                        <li>
                            <i class="fa fa-phone fa-fw"></i>
                            <a class="text-decoration-none" href="tel:010-020-0340">010-020-0340</a>
                        </li>
                        <li>
                            <i class="fa fa-envelope fa-fw"></i>
                            <a class="text-decoration-none" href="mailto:info@company.com">badminton@company.com</a>
                        </li>
                    </ul>
                </div>

                <div class="col-md-4 pt-5">
                    <h2 class="h2 text-light border-bottom pb-3 border-light">Products</h2>
                    <ul class="list-unstyled text-light footer-link-list">
                        <li><router-link class="text-decoration-none" to="/shop?category=racket">Vợt Cầu
                                Lông</router-link></li>
                        <li><router-link class="text-decoration-none" to="/shop?category=shoes">Giầy Cầu
                                Lông</router-link></li>
                        <li><router-link class="text-decoration-none" to="/shop?category=bag">Balo Cầu
                                Lông</router-link></li>
                        <li><router-link class="text-decoration-none" to="/shop?category=shirt">Áo Cầu
                                Lông</router-link></li>
                        <li><router-link class="text-decoration-none" to="/shop?category=dress">Váy Cầu
                                Lông</router-link></li>
                        <li><router-link class="text-decoration-none" to="/shop?category=pants">Quần Cầu
                                Lông</router-link></li>
                        <li><router-link class="text-decoration-none" to="/shop?category=accessories">Phụ Kiện Cầu
                                Lông</router-link></li>
                    </ul>
                </div>

                <div class="col-md-4 pt-5">
                    <h2 class="h2 text-light border-bottom pb-3 border-light">Further Info</h2>
                    <ul class="list-unstyled text-light footer-link-list">
                        <li><router-link class="text-decoration-none" to="/">Home</router-link></li>
                        <li><router-link class="text-decoration-none" to="/about">About Us</router-link></li>
                        <li><router-link class="text-decoration-none" to="/contact">Contact</router-link></li>
                        <li><router-link class="text-decoration-none" to="/faq">FAQs</router-link></li>
                    </ul>
                </div>

            </div>

            <div class="row text-light mb-4">
                <div class="col-12 mb-3">
                    <div class="w-100 my-3 border-top border-light"></div>
                </div>
                <div class="col-auto me-auto">
                    <ul class="list-inline text-left footer-icons">
                        <li class="list-inline-item border border-light rounded-circle text-center">
                            <a class="text-light text-decoration-none" target="_blank" href="https://facebook.com">
                                <i class="fab fa-facebook-f fa-lg fa-fw"></i>
                            </a>
                        </li>
                        <li class="list-inline-item border border-light rounded-circle text-center">
                            <a class="text-light text-decoration-none" target="_blank" href="https://instagram.com">
                                <i class="fab fa-instagram fa-lg fa-fw"></i>
                            </a>
                        </li>
                        <li class="list-inline-item border border-light rounded-circle text-center">
                            <a class="text-light text-decoration-none" target="_blank" href="https://twitter.com">
                                <i class="fab fa-twitter fa-lg fa-fw"></i>
                            </a>
                        </li>
                        <li class="list-inline-item border border-light rounded-circle text-center">
                            <a class="text-light text-decoration-none" target="_blank" href="https://linkedin.com">
                                <i class="fab fa-linkedin fa-lg fa-fw"></i>
                            </a>
                        </li>
                    </ul>
                </div>
                <div class="col-auto">
                    <label class="sr-only" for="subscribeEmail">Email address</label>
                    <div class="input-group mb-2">
                        <input type="text" class="form-control bg-dark border-light" id="subscribeEmail"
                            placeholder="Email address">
                        <div class="input-group-text btn-success text-light">Subscribe</div>
                    </div>
                </div>
            </div>
        </div>
    </footer>
    <!-- End Footer -->
</template>

<script>
export default {
    name: 'Footer'
}
</script>

<style scoped>
.footer-link-list li {
    margin-bottom: 0.5rem;
}

.footer-link-list a:hover {
    color: #198754 !important;
}

.footer-icons li {
    width: 2.5rem;
    height: 2.5rem;
    line-height: 2.5rem;
    margin-right: 0.5rem;
}

.footer-icons a:hover {
    color: #198754 !important;
    border-color: #198754 !important;
}
</style>