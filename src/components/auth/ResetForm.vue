<script setup>
import api from '@/api/axiosinterceptor';
import { computed, ref } from 'vue';
const email = ref('');
const emailRules = ref([(v) => !!v || '이메일을 입력해주세요', (v) => /.+@.+\..+/.test(v) || '이메일 형식으로 입력해주세요']);
const isLoading = ref(false);
const isValid =computed(()=>{
  return email.value 
})

const sendMail = ()=>{
    sendMailAPI();
}
const sendMailAPI=async()=>{
  try{
    isLoading.value = true;
    const response = await api.post('/users/reset-password-request',{
      email : email.value
    });
    console.log(response);
    if(response.data.code == 200){
		alert(response.data.result)
    }else{
      alert(response.data.message);
    }

  }catch(err){
    console.log(err);
  }finally{
    isLoading.value = false;
  }
}

</script>
<template>
      <v-progress-circular v-if="isLoading" indeterminate color="primary" size="50"
      style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></v-progress-circular>
    <v-form ref="form" class="mt-sm-13 mt-8">
        <v-label class="text-subtitle-1 font-weight-medium pb-2 text-lightText">이메일</v-label>
        <VTextField v-model="email" :rules="emailRules" required ></VTextField>
        <v-btn size="large" color="primary" block flat :disabled="!isValid" @click="sendMail">전송</v-btn>
    </v-form>
</template>
