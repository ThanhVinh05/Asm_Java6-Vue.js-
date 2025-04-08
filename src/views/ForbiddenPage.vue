<template>
    <div class="container py-5">
        <div class="row justify-content-center">
            <div class="col-md-8 text-center">
                <div class="card border-0 shadow-sm">
                    <div class="card-body p-5">
                        <div class="mb-4">
                            <i class="fas fa-lock fa-5x text-danger"></i>
                        </div>
                        <h1 class="display-1 fw-bold text-danger mb-4">403</h1>
                        <h2 class="mb-4">Forbidden</h2>
                        <p class="lead mb-4">Bạn không có quyền truy cập trang này</p>
                        <router-link to="/" class="btn btn-primary btn-lg">
                            <i class="fas fa-home me-2"></i>Về trang chủ
                        </router-link>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.card {
    border-radius: 1rem;
}

.btn-primary {
    background-color: #0d6efd;
    border-color: #0d6efd;
    padding: 0.75rem 2rem;
}

.btn-primary:hover {
    background-color: #0b5ed7;
    border-color: #0a58ca;
    transform: translateY(-2px);
    transition: transform 0.2s;
}

.display-1 {
    font-size: 6rem;
    font-weight: 700;
}

.lead {
    font-size: 1.25rem;
    color: #6c757d;
}
</style>
