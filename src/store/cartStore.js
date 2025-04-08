import { ref } from 'vue';
import { getCartItems } from '../api/cart';
import { tokenService } from '../utils/tokenService';

export const cartStore = {
    cartCount: ref(0),
    isLoading: ref(false),
    
    async updateCartCount() {
        if (this.isLoading.value) return;
        
        this.isLoading.value = true;
        try {
            const token = tokenService.getToken();
            if (!token) {
                this.cartCount.value = 0;
                return;
            }
            
            const items = await getCartItems();
            this.cartCount.value = items.length;
        } catch (error) {
            console.error('Error updating cart count:', error);
            this.cartCount.value = 0;
        } finally {
            this.isLoading.value = false;
        }
    },
    
    resetCart() {
        this.cartCount.value = 0;
    },

    async initializeCart() {
        await this.updateCartCount();
    }
};
