<script setup lang="ts">
import { computed, onMounted, ref ,nextTick } from 'vue';
import api from '@/api/axiosinterceptor';
import { useRouter ,useRoute} from 'vue-router';
import { mask } from 'maska';  

const userName = ref();
const grades = ref(['S등급', 'A등급','B등급','C등급','D등급']);
const customerName = ref(null);
const email = ref(null);
const company = ref(null);
const dept  = ref(null);
const position = ref(null);
const phone = ref(null);
const tel = ref(null);
const grade = ref(null);
const isKeyMan = ref(false);

const router = useRouter();
const route = useRoute();

onMounted(()=>{
    getCustomerInfoAPI(route.params.id);
})
const updateCustomer = ()=>{
    if(confirm("고객정보를 수정하시겠습니까?")){
        updateCustomerAPI(route.params.id);
    }
}

const getCustomerInfoAPI = async(id: string | string[])=>{
    try{
        const res = await api.get(`/customers/${id}`);
        if(res.data.code==200){
            console.log(res.data.result);
            const info = res.data.result;
            customerName.value = info.name;
            email.value = info.email;
            phone.value = info.phone;
            position.value = info.position;
            tel.value = info.tel;
            company.value = info.company;
            grade.value = info.grade;
            isKeyMan.value = info.keyMan;

            await nextTick();

            dept.value = info.dept;
            userName.value = info.userName;
        
        }
    }catch(err){
        console.log(`[ERROR 몌세지] : ${err}`);
    }
}

const updateCustomerAPI = async(id:string|string[])=>{
    try{
        const response = await api.patch(`/customers/${id}`,{
            name:customerName.value,
            company:company.value?company.value:null,
            dept:dept.value? dept.value:null,
            position:position.value?  position.value:null,
            phone:phone.value? phone.value:null,
            tel: tel.value?  tel.value:null,
            email:email.value ? email.value:null,
            grade:grade.value ? grade.value:null,
            isKeyMan:isKeyMan.value
        })
        console.log(response.data);
        if(response.data.code==200){
            alert(response.data.result);
            getCustomerInfoAPI(route.params.id);
        }

    }catch(err){
        console.log(`[ERROR 몌세지] : ${err}`);
    }

}

const confirmName = ref([
    (s:string)=> !! s|| '고객명을 입력해주세요'
]);

// 휴대폰 번호
const confirmPhone = ref([
    (s:string) => !!s|| '휴대폰 번호를 입력해주세요'
])
// 등급
const confirmGrade = ref([
(v: string) => !!v || '등급을 선택해주세요'
]);


// 이메일
const confirmEmail = ref([(v: string) => !!v || '이메일을 입력해주세요', (v: string) => /.+@.+\..+/.test(v) || '이메일 형식으로 입력해주세요']);


const formIsValid = computed(()=>{
    return customerName.value && email.value && grade.value && phone.value;
})


</script>
<template>
    <v-row>
        <v-col cols="6">
            <v-label class="font-weight-medium mb-2">고객명</v-label><span class="require">*</span>
            <v-text-field color="primary" v-model="customerName" variant="outlined" type="text" :rules="confirmName" required>
       
            </v-text-field>
        </v-col>
        <v-col cols="6">
            <v-label class="font-weight-medium mb-2">고객사</v-label>
            <v-text-field color="primary" v-model="company" variant="outlined" type="text"  hide-details>
            </v-text-field>
        </v-col>
        <v-col cols="6">
            <v-label class="font-weight-medium mb-2">부서</v-label>
            <v-text-field color="primary" v-model="dept" variant="outlined" type="text"  hide-details>
       
            </v-text-field>
        </v-col>
        <v-col cols="6">
            <v-label class="font-weight-medium mb-2">직책</v-label>
            <v-text-field color="primary" v-model="position" variant="outlined" type="text"  hide-details>
            </v-text-field>
        </v-col>

        <v-col cols="6">
            <v-label class="font-weight-medium mb-2">휴대폰 번호</v-label><span class="require">*</span>
            <v-text-field v-maska="'###-####-####'"  color="primary" v-model="phone" variant="outlined" type="text" placeholder="-를 제외하고 입력해주세요" :rules="confirmPhone">
            </v-text-field>
        </v-col>

        <v-col cols="6">
            <v-label class="font-weight-medium mb-2">유선번호</v-label>
            <v-text-field v-maska="'##-###-####'"  color="primary" v-model="tel" variant="outlined" type="text" placeholder="-를 제외하고 입력해주세요" hide-details>
            </v-text-field>
        </v-col>
        <v-col cols="6">
            <v-label class="font-weight-medium mb-2">이메일</v-label><span class="require">*</span>
            <v-text-field color="primary" v-model="email" variant="outlined" type="email" placeholder="john@gmail.com" required :rules="confirmEmail">
            </v-text-field>
        </v-col>

        <v-col cols="6">
            <v-label class="font-weight-medium mb-2">등급</v-label><span class="require">*</span>
            <v-select v-model="grade" :items="grades" single-line variant="outlined" :rules="confirmGrade"></v-select>
        </v-col>

        <v-col cols="6">
            <v-label class="font-weight-medium mb-2">키맨여부</v-label>
            <v-switch color="primary" v-model="isKeyMan" hide-details></v-switch>
        </v-col>
                 
        <v-col cols="6">
            <v-label class="font-weight-medium mb-2">담당자</v-label>
            <v-text-field disabled color="primary" variant="outlined" type="text"  hide-details v-model="userName">
        
            </v-text-field>
        </v-col>

    </v-row>
    <div class="d-flex gap-2 mt-5 justify-content flex-column flex-wrap flex-xl-nowrap flex-sm-row fill-height"> 
        <v-btn color="primary" variant="flat" @click="updateCustomer" :disabled="!formIsValid">수정</v-btn>
        <v-btn color="info" variant="outlined" to="/sales/contact">목록으로 돌아가기</v-btn>
    </div>   
</template>
<style scoped>
    .require{
        color: red;
    }
</style>