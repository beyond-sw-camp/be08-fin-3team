<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { Form } from 'vee-validate';
import baseApi from '@/api/baseapi';
import { useRouter } from 'vue-router';
import PasswordResetModal from '../modal/PasswordResetModal.vue';

const isEmployeeIdLogin = ref(false);
const password = ref('');
const email = ref('');
const employeeId = ref('');
const router = useRouter();
const authStore = useAuthStore();
const dialog = ref(false);
const isLoading = ref(false);

const passwordRules = ref([
    (v: string) => !!v || '비밀번호를 입력해주세요',
    (v: string) => (v && v.length >= 4) || '비밀번호는 4자리 이상으로 입력해주세요'
]);
const emailRules = ref([
    (v: string) => !!v || '이메일을 입력해주세요',
    (v: string) => /.+@.+\..+/.test(v) || '이메일 형식으로 입력해주세요'
]);

const employeeIdRules = ref([(v: string) => !!v || '사원번호를 입력해주세요']);

const formIsValid = computed(() => {
    // 계산된 속성 사용
    if (isEmployeeIdLogin.value) {
        return employeeId.value && password.value;
    } else {
        return email.value && password.value;
    }
});

const login = () => {
    if (formIsValid.value) {
        loginApi();
    }
};

const loginApi = async () => {
    try {
        isLoading.value = true;
        const res = await baseApi.post(
            '/users/login',
            {
                loginType: isEmployeeIdLogin.value ? 'employeeId' : 'email', // 로그인 방식 구분
                email: email.value ? email.value : null,
                employeeId: employeeId.value ? employeeId.value : null,
                password: password.value
            },
            {
                withCredentials: true
            }
        );
    //    console.log(res);
        if (res.data.code == 200) {
            alert('로그인을 완료했습니다.');
            const result = res.data.result;
            console.log(result);
            authStore.setIsLogedIn();
            saveLocalStorage(result);
            router.push('/');
        }
    } catch (err) {
        alert("로그인 정보를 다시 확인해주세요");
    } finally {
        isLoading.value = false;
    }
};
const saveLocalStorage = (result: any) => {
    localStorage.setItem('loginUserNo', result.userNo);
    localStorage.setItem('loginDeptNo', result.deptNo);
    localStorage.setItem('loginUserName', result.name);
    localStorage.setItem('loginUserEmail', result.email);
    localStorage.setItem('accessToken', result.accessToken);
    localStorage.setItem('loginUserRole', result.role);
    localStorage.setItem('profileUrl', result.profileUrl);
};

// const findPassword = ()=>{
//      dialog.value = true  // 창 열기
// }

const closeModal = () => {
    dialog.value = false; // 닫기
};
const saveHistory = () => {
    dialog.value = false;
};
</script>

<template>
    <div class="d-flex align-center text-center mb-6">
        <div class="text-h6 w-100 px-5 font-weight-regular position-relative">
            <span class="bg-surface px-5 py-3 position-relative">영업관리 로그인</span>
        </div>
    </div>
    <Form class="mt-5">
        <!-- 로그인 방식 선택 (체크박스 또는 스위치) -->
        <v-progress-circular
            v-if="isLoading"
            indeterminate
            color="primary"
            size="50"
            style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%)"
        ></v-progress-circular>
        <v-switch v-model="isEmployeeIdLogin" color="primary" label="사번으로 로그인" inset> </v-switch>
        <v-label class="text-subtitle-1 font-weight-medium pb-2 text-lightText" v-if="!isEmployeeIdLogin">이메일</v-label>
        <VTextField
            v-if="!isEmployeeIdLogin"
            v-model="email"
            placeholder="이메일을 입력해주세요"
            :rules="emailRules"
            class="mb-8"
            required
            hide-details="auto"
        ></VTextField>

        <v-label class="text-subtitle-1 font-weight-medium pb-2 text-lightText" v-if="isEmployeeIdLogin">사원번호</v-label>
        <VTextField
            v-if="isEmployeeIdLogin"
            v-model="employeeId"
            placeholder="사원번호를 입력해주세요"
            :rules="employeeIdRules"
            class="mb-8"
            required
            hide-details="auto"
        ></VTextField>
        <v-label class="text-subtitle-1 font-weight-medium pb-2 text-lightText">비밀번호</v-label>
        <VTextField
            v-model="password"
            placeholder="비밀번호를 입력해주세요"
            :rules="passwordRules"
            required
            hide-details="auto"
            type="password"
            class="pwdInput"
        ></VTextField>
        <!-- <PasswordResetModal :dialog="dialog" @update:dialog="dialog=$event" @close="closeModal" @save="saveHistory"/> -->
        <div class="d-flex flex-wrap align-center my-3 ml-n2">
            <div class="ml-sm-auto">
                <RouterLink to="/auth/find-password" class="text-primary text-decoration-none text-body-1 opacity-1 font-weight-medium"
                    >비밀번호 찾기</RouterLink
                >
            </div>
        </div>
        <v-btn size="large" :disabled="!formIsValid" color="primary" block flat @click="login">로그인</v-btn>
        <!-- <div v-if="errors.apiError" class="mt-2">
            <v-alert color="error">{{ errors.apiError }}</v-alert>
        </div> -->
    </Form>
</template>
