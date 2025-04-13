<template>
    <div class="container py-5">
        <div class="row mb-5">
            <div class="col-12 text-center">
                <h1 class="display-5 fw-bold mb-3">About Badminton Shop</h1>
                <p class="lead text-muted">Your trusted partner in badminton equipment</p>
            </div>
        </div>
        <div class="row mb-5">
            <div class="col-lg-8 mx-auto">
                <div class="card border-0 shadow-sm mb-4">
                    <div class="card-body p-5">
                        <h2 class="fw-bold mb-4">
                            <i class="fas fa-history me-2 text-success"></i>Our Story
                        </h2>
                        <p class="text-muted mb-4">Founded in 2024, Badminton Shop started with a simple mission: to
                            provide high-quality badminton equipment to players of all levels. Our passion for the sport
                            drives us to constantly improve and expand our product range.</p>
                        <p class="text-muted">We believe that every player deserves access to the best equipment,
                            regardless of their skill level. That's why we carefully select our products and work
                            directly with manufacturers to ensure quality and affordability.</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="row mb-5">
            <div class="col-12 text-center">
                <h2 class="display-6 fw-bold mb-4">Our Values</h2>
                <p class="lead text-muted mb-5">What makes us different</p>
            </div>
        </div>
        <div class="row g-4">
            <div class="col-md-4">
                <div class="card h-100 border-0 shadow-sm text-center p-4 value-card">
                    <div class="card-body">
                        <div class="value-icon mb-4">
                            <i class="fas fa-medal text-success fa-3x"></i>
                        </div>
                        <h5 class="card-title">Quality First</h5>
                        <p class="card-text text-muted">We never compromise on quality. Every product in our store meets
                            our strict standards.</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card h-100 border-0 shadow-sm text-center p-4 value-card">
                    <div class="card-body">
                        <div class="value-icon mb-4">
                            <i class="fas fa-handshake text-success fa-3x"></i>
                        </div>
                        <h5 class="card-title">Customer Satisfaction</h5>
                        <p class="card-text text-muted">Your satisfaction is our priority. We're here to help you find
                            the perfect equipment.</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card h-100 border-0 shadow-sm text-center p-4 value-card">
                    <div class="card-body">
                        <div class="value-icon mb-4">
                            <i class="fas fa-leaf text-success fa-3x"></i>
                        </div>
                        <h5 class="card-title">Sustainability</h5>
                        <p class="card-text text-muted">We're committed to reducing our environmental impact through
                            sustainable practices.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.value-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    border-radius: 10px;
}

.value-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
}

.value-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(25, 135, 84, 0.1);
    border-radius: 50%;
    transition: transform 0.3s ease;
}

.value-card:hover .value-icon {
    transform: scale(1.1);
}

@media (max-width: 768px) {
    .value-card {
        margin-bottom: 1rem;
    }
}
</style>