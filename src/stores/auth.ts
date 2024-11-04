import { defineStore } from 'pinia';
import { router } from '@/router';
import { fetchWrapper } from '@/utils/helpers/fetch-wrapper';

const baseUrl = `${import.meta.env.VITE_API_URL}/users`;

export const useAuthStore = defineStore({
    id: 'auth',
    state: () => ({
        //  isLoggedIn:localStorage.getItem('isLoggedIn')=='true',
        // initialize state from local storage to enable user to stay logged in
        // @ts-ignore
        name: localStorage.getItem('loginUserName'),
        email: localStorage.getItem('loginUserEmail'),
        //  dept : localStorage.getItem('loginUserDept'),
        user: localStorage.getItem('loginUserName'),
        // role: localStorage.getItem("loginUserRole")||"USER",
        returnUrl: null
    }),
    actions: {
        setIsLogedIn() {
            localStorage.setItem('isLoggedIn', 'true');
        },

        logout() {
            this.user = null;
            localStorage.removeItem('loginUserNo');
            localStorage.removeItem('loginDeptNo');
            localStorage.removeItem('loginUserName');
            localStorage.removeItem('loginUserEmail');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('profileUrl');
            localStorage.setItem('isLoggedIn', 'false');
            localStorage.removeItem('loginUserRole'), router.push({ name: 'Login' });
        }
    }
});
