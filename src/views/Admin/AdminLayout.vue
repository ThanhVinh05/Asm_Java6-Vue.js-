<script setup>
import AdminSidebar from '../../components/layout/Admin/sidebar.vue';
</script>

<template>
    <div class="admin-layout">

        <div class="container-fluid">
            <div class="row">
                <!-- Sidebar -->
                <div class="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse">
                    <AdminSidebar />
                </div>

                <!-- Main Content -->
                <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
                    <router-view></router-view>
                </main>
            </div>
        </div>
    </div>
</template>

<style scoped>
.admin-layout {
    min-height: 100vh;
}

.sidebar {
    max-height: 160vh;
    top: 100px;
    bottom: 0;
    left: 0;
    z-index: 100;
    box-shadow: inset -1px 0 0 rgba(0, 0, 0, .1);
}

main {
    padding-top: 1.5rem;
}
</style>