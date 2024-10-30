<script setup>
import Logo from '@/layouts/full/logo/LogoAuth.vue';
import ResetPassword from '@/components/auth/ResetForm.vue';
import LogoIcon from '@/assets/images/logos/logolight.svg';
import { onMounted, ref } from 'vue';
import api from '@/api/axiosinterceptor';
import { useRoute,useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const password = ref();
const confirmPassword = ref();
const email = ref();
const token = ref();

onMounted(()=>{
    token.value = route.query.token;
    email.value = route.query.email;
})
const passwordRules = ref([
    (v) => !!v || '비밀번호를 입력해주세요',
    (v) => (v && v.length >= 4) || '비밀번호는 4자리 이상으로 입력해주세요'
]);

const confirmPasswordRules = ref([
    (v) => !!v || '비밀번호 확인칸을 입력해주세요',
    (v) => (v===password.value) || '비밀번호를 다시 확인해주세요'
]);

const changePassword = ()=>{
    if(password.value !== confirmPassword.value){
        alert("입력 양식을 확인해주세요")
        return;
    }
    updatePwdAPI();
}

const updatePwdAPI =async()=>{
    try{
        const response = await api.post("/users/reset-password",{
            email:email.value,
            token:token.value,
            newPwd:password.value
        });
        console.log(response);
        if(response.data.code == 200){
            alert(response.data.result);
            router.push({
                name:"Login"
            })
        }else{
            alert(response.data.message);
        }

    }catch(err){
        console.log(err);
    }
}
</script>

<template>
    <div class="authentication">
        <v-container fluid class="pa-3">
             <v-row class="h-100vh d-flex justify-center align-center">
                <v-col cols="12" lg="4"  xl="5" class="d-flex align-center">
                    <v-card rounded="md" elevation="10" class="px-sm-1 px-0  mx-auto">
                        <v-card-item class="pa-sm-8">
                            <div class="d-flex justify-center my-5">  <img :src="LogoIcon" alt="home" /></div>
      
                            <v-col cols="12">
            <v-label class="text-subtitle-1 font-weight-medium pb-2">비밀번호</v-label>
                <VTextField
                    v-model="password"
                    :counter="10"
                    placeholder="비밀번호를 입력해주세요"
                    :rules="passwordRules"
                    required
                    variant="outlined"
                    type="password"
                    color="primary"
                ></VTextField>
                <v-label class="text-subtitle-1 font-weight-medium pb-2">비밀번호 확인</v-label>
                <VTextField
                    v-model="confirmPassword"
                    :counter="10"
                    placeholder="비밀번호를 입력해주세요"
                    :rules="confirmPasswordRules"
                    required
                    variant="outlined"
                    type="password"
                    color="primary"
        ></VTextField>
        <v-btn size="large"  class="mt-2 signup-btn" color="primary" block flat @click=changePassword>비밀번호 변경</v-btn>
        </v-col>

      
                        </v-card-item>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>
 