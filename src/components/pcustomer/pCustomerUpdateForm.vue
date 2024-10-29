<script setup>
import { computed, onMounted, ref } from 'vue';
import api from '@/api/axiosinterceptor';
import { useRouter ,useRoute} from 'vue-router';
import { useAlert } from '@/utils/useAlert';
import AlertComponent from '@/components/shared/AlertComponent.vue';
import EditConfirmDialog from '../shared/EditConfirmDialog.vue';
import ConfirmDialogs from '../shared/ConfirmDialogs.vue';

const { alertMessage, alertType, showAlert, triggerAlert } = useAlert();

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
const fax = ref('');
const note = ref('');
const cls = ref('');
const clsOptions = ref(['자사홈페이지','인터넷검색','지인소개','제품설명회','세미나','전화(인바운드)','채팅','매일','기타']);
const contact = ref('');
const contactOptions = ref(['미접촉','접촉시도','접촉중','접촉금지','고객전환','기존고객'])
const address = ref('');
const loggedInUserEmail = ref(localStorage.getItem("loginUserEmail"));
const userEmail = ref();

const showEditConfirmDialog = ref(false);
const showDeleteConfirmDialog = ref(false);

const router = useRouter();
const route = useRoute();

onMounted(()=>{
    getCustomerInfoAPI(route.params.id);
})
const updatePCustomer = ()=>{
    showEditConfirmDialog.value = true; 
}

const deletePCustomer = ()=>{
    showDeleteConfirmDialog.value = true;
}

const updatePCustomerAPI=async(id)=>{
    try{
        const response = await api.patch(`/pcustomers/${id}`,{
            name:pcName.value?pcName.value:"",  // 필수
            company:company.value?company.value:null,
            dept:dept.value?dept.value:null,
            position:position.value?position.value:null,
            cls:cls.value?cls.value:"", // 필수
            status:contact.value?contact.value:null, // 필수
            grade:grade.value?grade.value:null,
            phone:phone.value?phone.value:"", // 필수
            tel:tel.value?tel.value:null,
            email:email.value?email.value:null,
            fax:fax.value? fax.value:null,
            addr:address.value?address.value:null,
            note:note.value?note.value:null,
        });
        console.log(response.data);
        if(response.data.code ==200){
            // alert(response.data.result);   
            showEditConfirmDialog.value = false;
            triggerAlert('수정이 완료되었습니다.', 'success');
        //    getCustomerInfoAPI(route.params.id);
        }else{
            triggerAlert(response.data.message,'warning');
            showEditConfirmDialog.value = false; 
        }
    }catch(err){
        console.log(`[ERROR 몌세지] : ${err}`);
    }

}

const getCustomerInfoAPI = async(id)=>{
    try{
        const res = await api.get(`/pcustomers/${id}`);
        console.log(res.data.result);
        if(res.data.code==200){
            const info = res.data.result;
            pcName.value = info.name;
            company.value = info.company;
            dept.value = info.dept;
            position.value = info.position;
            cls.value = info.cls;
            contact.value = info.status;
            grade.value = info.grade;
            phone.value = info.phone;
            tel.value = info.tel;
            email.value = info.email;
            fax.value = info.fax;
            address.value = info.addr;
            note.value = info.note;
            userEmail.value = info.userEmail;
        }
    }catch(err){
        console.log(err);
    }
}

const deletePCustoemrAPI=async(id)=>{
    try{
        const response = await api.delete(`/pcustomers/${id}`);
        console.log(response);
        if(response.data.code == 200){
            showDeleteConfirmDialog.result = false;
            triggerAlert(response.data.result,'success');
            setTimeout(() => {
                router.push({ name: "pCustomer" });
            }, 2000); 
        }
    }catch(err){
        console.log(err);
    }

}

const confirmName = ref([
    (s)=> !! s|| '고객명을 입력해주세요'
]);

// 휴대폰 번호
const confirmPhone = ref([
    (s) => !!s|| '휴대폰 번호를 입력해주세요'
])


// 접촉구분
const confirmCls = ref([
    (v) => !!v || '접촉구분을 선택해주세요'
])

// 접촉구분
const confirmContact = ref([
    (v) => !!v || '접촉상태를 선택해주세요'
])


const formIsValid = computed(()=>{
    return pcName.value && cls.value && contact.value && phone.value;
})


onMounted(()=>{
    userName.value = localStorage.getItem('')||'';
})

const isAssignedUser = computed(()=> userEmail.value === loggedInUserEmail.value);
</script>
<template>
    <AlertComponent :show="showAlert" :message="alertMessage" :type="alertType" />
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

    <EditConfirmDialog
        :dialog="showEditConfirmDialog"
        message="고객정보를 수정하시겠습니까?"
        @confirm="updatePCustomerAPI(route.params.id)"
        @close="showEditConfirmDialog = false"
    />

    <ConfirmDialogs
        :dialog="showDeleteConfirmDialog"
        message="고객정보를 삭제하시겠습니까?"
        @agree="deletePCustoemrAPI(route.params.id)"
        @disagree="showDeleteConfirmDialog = false"
    />
    <div class="d-flex gap-3 mt-5 justify-content flex-column flex-wrap flex-xl-nowrap flex-sm-row fill-height"> 
            <v-btn v-if="isAssignedUser" color="primary" variant="flat" @click="updatePCustomer" :disabled="!formIsValid">수정</v-btn>
            <v-btn v-if="isAssignedUser" color="error" class="mr-2"  @click="deletePCustomer">삭제</v-btn>
            <v-btn color="info" variant="outlined" to="/sales/prospect">목록으로 돌아가기</v-btn>
    </div>   
</template>
<style scoped>
    .require{
        color: red;
    }
</style>