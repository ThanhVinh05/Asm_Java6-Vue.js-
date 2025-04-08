import { ref } from 'vue';

export const userStore = {
    userName: ref(''),
    isLoggedIn: ref(false),
    userRole: ref(null),

    setUserInfo(username, role) {
        this.userName.value = username;
        this.isLoggedIn.value = true;
        this.userRole.value = role;
    },

    clearUserInfo() {
        this.userName.value = '';
        this.isLoggedIn.value = false;
        this.userRole.value = null;
    }
};
