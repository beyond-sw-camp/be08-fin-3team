<script setup lang="ts">
import api from "@/api/axiosinterceptor";
import { ref,defineProps,defineEmits, computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const props = defineProps({
  dialog:{
    type:Boolean,
    required:true
  }
});
const emit  = defineEmits(["update:dialog","close","save"]);
const email = ref();


const confirmEmail = ref([
    (s:string)=> !! s|| '이메일을 입력해주세요'
]);

const formIsValid = computed(()=>{
    return email.value;
})

const sendMail = ()=>{
 
  if(formIsValid.value){
    sendMailAPI(route.params.id);
    
  }else{
    alert("필수 정보를 입력해주세요");
  }
  
}
const resetForm =()=>{
	email.value = '';
}

const sendMailAPI=async(id: string | string[])=>{
  try{
    const response = await api.post('/users/reset-password-request',{
      email : email.value
    });
    console.log(response);
    if(response.data.code == 200){
        resetForm();
		alert(response.data.result)
        emit('save'); 
    }else{
      alert(response.data.message);
    }

  }catch(err){
    console.log(err);
  }
}

</script>

<template>
  <div class="text-center">
    <v-dialog v-model="props.dialog" persistent class="dialog-mw" @update:modelValue="emit('update:dialog', $event)" max-height="360px">
      <v-card style="height: 250px" class="overflow-auto">
        <v-container class="pb-0">
        <v-card-title class="pa-5">
          <span class="text-h5">가입한 이메일을 입력해주세요</span>
        </v-card-title>
        <v-card-text>
          
            <v-row>
              <v-col cols="12" sm="6" >
                <v-label class="font-weight-medium">이메일</v-label><span class="require">*</span>
                <v-text-field color="primary" variant="outlined" v-model="email" type="email" :rules="confirmEmail"></v-text-field>
              </v-col>

            </v-row>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" variant="text" @click="emit('close')" flat>
            닫기
          </v-btn>
          <v-btn color="success" variant="text" @click="sendMail" flat>
            전송
          </v-btn>
        </v-card-actions>
      </v-container>
      </v-card>
    </v-dialog>
  </div>
</template>

<style>
    .require{
        color: red;
    }
  </style>
