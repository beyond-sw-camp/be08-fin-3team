const AuthRoutes = {
    path: '/auth',
    component: () => import('@/layouts/blank/BlankLayout.vue'),
    meta: {
        requiresAuth: false
    },
    children: [

        {
            name: 'Side Login',
            path: '/auth/login1',
            component: () => import('@/views/authentication/SideLogin.vue')
        },
        {
            name: 'Boxed Login',
            path: '/auth/login2',
            component: () => import('@/views/authentication/BoxedLogin.vue')
        },
        {
            name: 'Login',
            path: '/auth/login',
            component: () => import('@/views/authentication/Login.vue')
        },
    
        {
            name: 'Boxed Register',
            path: '/auth/register2',
            component: () => import('@/views/authentication/BoxedRegister.vue')
        },
        {
            name: 'SignUp',
            path: '/auth/signup',
            component: () => import('@/views/authentication/SignUp.vue')
        },
        {
            name: 'Side Forgot Password',
            path: '/auth/forgot-password',
            component: () => import('@/views/authentication/SideForgotPassword.vue')
        },
        {
            name: 'Boxed Forgot Password',
            path: '/auth/forgot-password2',
            component: () => import('@/views/authentication/BoxedForgotPassword.vue')
        },
        {
            name: 'Side Two Steps',
            path: '/auth/two-step',
            component: () => import('@/views/authentication/SideTwoStep.vue')
        },
        {
            name: 'Boxed Two Steps',
            path: '/auth/two-step2',
            component: () => import('@/views/authentication/BoxedTwoStep.vue')
        },
        {
            name: 'Error',
            path: '/auth/404',
            component: () => import('@/views/authentication/Error.vue')
        },
        {
            name: 'Maintenance',
            path: '/auth/maintenance',
            component: () => import('@/views/authentication/Maintenance.vue')
        },
        {
            name:"FindPassword",
            path: "/auth/find-password",
            component:() => import('@/views/authentication/FindPassword.vue')
        },
        {
            name:"ChangePassword",
            path: "/auth/change-password",
            component:() => import('@/views/authentication/ChangePassword.vue')
        }
    ]
};

export default AuthRoutes;
