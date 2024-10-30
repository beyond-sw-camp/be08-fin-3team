<script setup lang="ts">
import { ref , computed} from 'vue';
import baseApi from '@/api/baseapi';
import { useRouter } from 'vue-router';

const valid = ref(false); // 이메일 인증 완료 여부
const password = ref('');
const confirmPassword = ref('');
const email = ref('');
const deptName = ref('부서를 선택해주세요');
const depts = ref(['영업부','개발부','인사부','총무부','기획부','전산,IT부']);
const showCodeInput = ref(false);
const loading = ref(false);
const code = ref();
const mailBtnDisable = ref(false);
const codeBtnNotDisable = ref(true);
const isLoading = ref(false);

const router = useRouter();

const passwordRules = ref([
    (v: string) => !!v || '비밀번호를 입력해주세요',
    (v: string) => (v && v.length >= 4) || '비밀번호는 4자리 이상으로 입력해주세요'
]);

const confirmPasswordRules = ref([
    (v: string) => !!v || '비밀번호 확인칸을 입력해주세요',
    (v: string) => (v===password.value) || '비밀번호를 다시 확인해주세요'
]);
const emailRules = ref([(v: string) => !!v || '이메일을 입력해주세요', (v: string) => /.+@.+\..+/.test(v) || '이메일 형식으로 입력해주세요']);
const name = ref('');
const nameRules = ref([
    (v: string) => !!v || '이름을 입력해주세요',
    (v: string) => (v && v.length <= 10) || '이름은 10글자 이하로 입력해주세요'
]);

const formIsValid = computed(()=>{// 계산된 속성 사용
    return email.value && name.value && password.value && confirmPassword.value && valid.value && (deptName.value !=="부서를 선택해주세요") && (password.value===confirmPassword.value);

})
const mailIsValid = computed(() => {
//   return email.value && emailRules.value.every(rule => rule(email.value) === true);
    return email.value && /.+@.+\..+/.test(email.value); // 이메일 유효성 검사
});

const isSendButtonDisabled = computed(() => {
    return !mailIsValid.value || loading.value || mailBtnDisable.value;
});

const codeIsValid = computed(()=>{
    return code.value && (code.value.length==6) && codeBtnNotDisable.value;
})

const signUp=()=>{
    if(formIsValid.value){

        signUpApi();
    }    
}

const signUpApi = async()=>{
    try{
        isLoading.value = true;
        const res = await baseApi.post('/users/join',{
            name:name.value,
            email:email.value,
            deptName:deptName.value,
            password:password.value,

        })
        console.log(res);
        if(res.data.code==200){
                alert('정상적으로 회원가입이 완료되었습니다.');
                if(confirm(`사원번호 발급 : ${res.data.result.employeeId}`)){
                    router.push({
                    name: "Login"
            });
                }
            }else{
                alert(res.data.message);
            }
    }catch(err){
        console.log(err);
    }finally{
        isLoading.value = false;
    }
}

const sendEmail = async()=>{
    if (loading.value) return;

    try{
        loading.value = true;
       const res = await baseApi.post("/users/email/code-request",{
        email: email.value
       });
       console.log(res.data);
       if(res.data.code ===200){
        showCodeInput.value = true; 
        alert('인증코드가 이메일로 발송되었습니다.');
    
       }else{
        alert(res.data.message);
       }
    }catch(err){
        console.log(err);

    }finally{
        loading.value = false;
    }
}

const sendCodeCheck = async()=>{
    try{
        const res = await baseApi.post("/users/email/code-check",{
            email: email.value,
            code:code.value
        });

        console.log(res);
        if(res.data.code ===200){
            alert("인증을 완료했습니다.");
            valid.value = true;
            mailBtnDisable.value = true;
            codeBtnNotDisable.value = false;

        }else{
            alert(res.data.message);
        }

    }catch(err){
    }
}
</script>
<template>
    <div class="d-flex align-center text-center mb-2">
    </div>
    <v-row>
        <v-col cols="12 pb-0">
            <v-progress-circular v-if="isLoading" indeterminate color="primary" size="50"
            style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></v-progress-circular>
            <v-label class="text-subtitle-1 font-weight-medium pb-2">이름</v-label>
            <VTextField v-model="name" :rules="nameRules" required placeholder="이름을 입력해주세요" ></VTextField>
            <v-label class="mb-2 font-weight-medium">부서</v-label>
            <v-select
                v-model="deptName"
                :items="depts"
                placeholder="부서를 선택해주세요"  
                item-title="state"
                item-value="abbr"
                return-object
                single-line
                variant="outlined"
            ></v-select>
        </v-col>
        <v-col cols="12" sm="8">      
            <v-label class="text-subtitle-1 font-weight-medium pb-2">이메일</v-label>
            <VTextField v-model="email" :rules="emailRules" required placeholder="이메일을 입력해주세요"></VTextField>
        </v-col>
        <v-col cols="12" sm="4">      
            <v-btn block flat class="mt-7 send-code-btn" size="large" :disabled="isSendButtonDisabled" @click="sendEmail">메일 인증</v-btn>
        </v-col>
        <v-col cols="12" sm="9" v-if="showCodeInput">      
            <VTextField required placeholder="인증코드 6자리 입력" v-model="code" type="number"></VTextField>
        </v-col>
        <v-col cols="12 pb-0" sm="3" v-if="showCodeInput">      
            <v-btn block color="primary" flat class="send-code-check" size="large" :disabled="!codeIsValid" @click="sendCodeCheck">확인</v-btn>
        </v-col>
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
        <v-btn size="large" :disabled="!formIsValid" class="mt-2 signup-btn" color="primary" block flat @click="signUp">회원가입</v-btn>
        </v-col>
    </v-row>

</template>

<style>
.send-code-btn {
    background-color:rgb(240, 74, 74);
    color: white;
}

</style>