<script setup>
import { RouterLink } from 'vue-router';
</script>

<template>
    <div class="position-sticky pt-3">
        <ul class="nav flex-column">
            <li class="nav-item">
                <RouterLink class="nav-link" to="/admin/dashboard">
                    <i class="fas fa-tachometer-alt me-2"></i>
                    Dashboard
                </RouterLink>
            </li>
            <li class="nav-item">
                <RouterLink class="nav-link" to="/admin/products">
                    <i class="fas fa-box me-2"></i>
                    Products
                </RouterLink>
            </li>
            <li class="nav-item">
                <RouterLink class="nav-link" to="/admin/orders">
                    <i class="fas fa-shopping-cart me-2"></i>
                    Orders
                </RouterLink>
            </li>
            <li class="nav-item">
                <RouterLink class="nav-link" to="/admin/users">
                    <i class="fas fa-users me-2"></i>
                    Users
                </RouterLink>
            </li>
            <li class="nav-item">
                <RouterLink class="nav-link" to="/admin/categories">
                    <i class="fas fa-tags me-2"></i>
                    Categories
                </RouterLink>
            </li>
        </ul>
    </div>
</template>

<style scoped>
.nav-link {
    color: #333;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
}

.nav-link:hover {
    background-color: rgba(0, 0, 0, 0.05);
}

.nav-link.router-link-active {
    color: #0d6efd;
    background-color: rgba(13, 110, 253, 0.1);
}

.nav-link i {
    width: 20px;
    text-align: center;
}
</style>