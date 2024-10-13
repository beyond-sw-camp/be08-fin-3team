import { defineStore } from 'pinia';
import { router } from '@/router';
import { fetchWrapper } from '@/utils/helpers/fetch-wrapper';

const baseUrl = `${import.meta.env.VITE_API_URL}/users`;

export const useAuthStore = defineStore({
    id: 'auth',
    state: () => ({
        // initialize state from local storage to enable user to stay logged in
        // @ts-ignore
        user: JSON.parse(localStorage.getItem('loginUserName')),
        returnUrl: null
    }),
    actions: {
        
        logout() {
            this.user = null;
            localStorage.removeItem('loginUserName');
            localStorage.removeItem('loginUserEmail');
            localStorage.removeItem('loginUserToken');
            router.push({name:"Login"});
        }
    }
});
