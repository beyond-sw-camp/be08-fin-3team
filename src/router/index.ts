import { createRouter, createWebHistory } from 'vue-router';
import MainRoutes from './MainRoutes';
import AuthRoutes from './AuthRoutes';
import { useAuthStore } from '@/stores/auth';

export const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/:pathMatch(.*)*',
            component: () => import('@/views/authentication/Error.vue')
        },
        MainRoutes,
        AuthRoutes
    ]
});


router.beforeEach(async (to, from, next) => {
    // 로그인 필요 여부와 관리자 페이지 여부 확인
    const publicPages = ['/auth/login', '/auth/signup','/auth/find-password','/auth/change-password'];
    const adminPages = ['/admin/departments', '/admin/products', '/admin/processes','/admin/targetsales', '/apps/chart/targetsales/status', '/apps/chart/sales/pridictions'];
    const authRequired = !publicPages.includes(to.path);
    const checkPath = adminPages.includes(to.path);
    const userRole = localStorage.getItem('loginUserRole');
    const auth: any = useAuthStore();

    // 로그인 필수 페이지 처리
    if (authRequired && !localStorage.getItem('isLoggedIn')) {
        auth.returnUrl = to.fullPath;
        return next('/auth/login');
    }

    // 관리자 전용 페이지 처리
    if (checkPath && userRole !== 'ADMIN') {
        alert("관리자만 접근 가능합니다");
        next('/'); // 홈으로 리다이렉트
        return
    }

    // 모든 조건 통과 시 페이지 이동 허용
    next();
});
