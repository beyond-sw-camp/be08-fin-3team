<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { mask } from 'maska';  
import api from '@/api/axiosinterceptor';

const userName = ref('');
const grades = ref(['S등급', 'A등급','B등급','C등급']);
const pcName = ref('');
const email = ref('');
const company = ref('');
const dept  = ref('');
const position = ref('');
const phone = ref('');
const tel = ref('');
const grade = ref('');
const token = ref('');
const fax = ref('');
const note = ref('');
const cls = ref('');
const clsOptions = ref(['자사홈페이지','인터넷검색','지인소개','제품설명회','세미나','전화(인바운드)','채팅','매일','기타']);
const contact = ref('');
const contactOptions = ref(['미접촉','접촉시도','접촉중','접촉금지','기존고객'])
const address = ref('');

const router = useRouter();

onMounted(()=>{
    userName.value = localStorage.getItem('loginUserName')||'';
    const storedToken = localStorage.getItem("accessToken")||'';
    if(storedToken){
        console.log(storedToken);
        token.value = String(storedToken);
        console.log(token.value);
    }
    
})

const registerPCustomer = ()=>{
    registerAPI();
}
const registerAPI = async()=>{
    try{
        const response = await api.post('/pcustomers/add',{
            name:pcName.value?pcName.value:"",  // 필수
            company:company.value?company.value:null,
            dept:dept.value?dept.value:null,
            position:position.value?position.value:null,
            cls:cls.value?cls.value:"", // 필수
            contactStatus:contact.value?contact.value:null, // 필수
            grade:grade.value?grade.value:null,
            phone:phone.value?phone.value:"", // 필수
            tel:tel.value?tel.value:null,
            email:email.value?email.value:null,
            fax:fax.value? fax.value:null,
            addr:address.value?address.value:null,
            note:note.value?note.value:null,
                      
        }
     )
        if(response.data.code==200){
            alert(response.data.result);
            router.push({
                name: "pCustomer"
            });
        }else{
            alert(response.data.result);
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


// 이메일
const confirmEmail = ref([(v: string) => !!v || '이메일을 입력해주세요', (v: string) => /.+@.+\..+/.test(v) || '이메일 형식으로 입력해주세요']);


// 접촉구분
const confirmCls = ref([
    (v: string) => !!v || '접촉구분을 선택해주세요'
])

// 접촉구분
const confirmContact = ref([
    (v: string) => !!v || '접촉상태를 선택해주세요'
])


const formIsValid = computed(()=>{
    return pcName.value && cls.value && contact.value && phone.value;
})



</script>
<template>
    <v-row>
        <v-col cols="6">
            <v-label class="font-weight-medium mb-2">고객명</v-label><span class="require">*</span>
            <v-text-field color="primary" v-model="pcName" variant="outlined" type="text" :rules="confirmName" required>
       
            </v-text-field>
        </v-col>
        <v-col cols="6">
            <v-label class="font-weight-medium mb-2">고객사</v-label>
            <v-text-field color="primary" v-model="company" variant="outlined" type="text"  hide-details>
            </v-text-field>
        </v-col>
        <v-col cols="6">
            <v-label class="font-weight-medium mb-2">부서</v-label>
            <v-text-field color="primary" v-model="dept" variant="outlined" type="text" hide-details>
       
            </v-text-field>
        </v-col>
        <v-col cols="6">
            <v-label class="font-weight-medium mb-2">직책</v-label>
            <v-text-field color="primary" v-model="position" variant="outlined" type="text" hide-details>
            </v-text-field>
        </v-col>

        <v-col cols="6">
            <v-label class="font-weight-medium mb-2">접촉구분</v-label><span class="require">*</span>
            <v-select v-model="cls" :items="clsOptions" single-line variant="outlined" :rules="confirmCls" ></v-select>
        </v-col>

        <v-col cols="6">
            <v-label class="font-weight-medium mb-2">접촉상태</v-label><span class="require">*</span>
            <v-select v-model="contact" :items="contactOptions" single-line variant="outlined" :rules="confirmContact"></v-select>
        </v-col>

        <v-col cols="6">
            <v-label class="font-weight-medium mb-2">가망등급</v-label>
            <v-select v-model="grade" :items="grades" single-line variant="outlined" ></v-select>
        </v-col>

        <v-col cols="6">
            <v-label class="font-weight-medium mb-2">휴대폰번호</v-label><span class="require">*</span>
            <v-text-field v-maska="'###-####-####'"  color="primary" v-model="phone" variant="outlined" type="text" placeholder="-를 제외하고 입력해주세요" :rules="confirmPhone">
            </v-text-field>
        </v-col>

        <v-col cols="6">
            <v-label class="font-weight-medium mb-2">유선번호</v-label>
            <v-text-field v-maska="'##-###-####'"  color="primary" v-model="tel" variant="outlined" type="text" placeholder="-를 제외하고 입력해주세요" hide-details>
            </v-text-field>
        </v-col>
        <v-col cols="6">
            <v-label class="font-weight-medium mb-2">이메일</v-label>
            <v-text-field color="primary" v-model="email" variant="outlined" type="email"/>
        </v-col>

        <v-col cols="6">
            <v-label class="font-weight-medium mb-2">팩스번호</v-label>
            <v-text-field color="primary" v-model="fax" variant="outlined"/>
        </v-col>


        <v-col cols="6">
            <v-label class="font-weight-medium mb-2">주소</v-label>
            <v-text-field color="primary" v-model="address" variant="outlined" />
        </v-col>
        

        <v-col cols="6">
            <v-label class="font-weight-medium mb-2">비고</v-label>
            <v-textarea v-model="note"  variant="solo"/>
        </v-col>
    </v-row>

    <div class="d-flex gap-3 mt-5 mb-7 justify-content flex-column flex-wrap flex-xl-nowrap flex-sm-row fill-height"> 
            <v-btn color="info" variant="outlined" to="/sales/prospect">목록</v-btn>
            <v-btn color="primary" variant="outlined" @click="registerPCustomer" :disabled="!formIsValid">고객 등록</v-btn>
    </div>   

</template>
<style scoped>
    .require{
        color: red;
    }
</style>