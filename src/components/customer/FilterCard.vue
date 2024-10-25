<template>
    <div>
        <v-row class="select_row">
            <h1 class="title">검색조건</h1>
            <v-col cols="12" class="select_col">
                <v-select v-model="selectedItem" :items="items" single-line variant="outlined" hide-details placeholder="검색조건"></v-select>
            </v-col>

            <v-col cols=12>
                <v-text-field v-model="searchQuery" color="primary" variant="outlined" type="text" placeholder="검색어" hide-details>   
                </v-text-field>
            </v-col>

            <v-col cols="12">
                <v-select v-model="selectedKey" :items="selectKey" single-line variant="outlined" hide-details></v-select>
            </v-col>

            <v-col cols=12>
                <!-- <v-text-field v-model="personInCharge" color="primary" variant="outlined" type="text" placeholder="담당자" hide-details />    -->
                <v-select v-model="selectedUser" :items="userOptions" item-value="id" item-title="displayName" return-object placeholder="담당자"></v-select>
            </v-col>
            <v-col cols="12">
                <v-btn class="search_btn" variant="flat" color="primary" @click="search">검색</v-btn>
            </v-col>
            
        </v-row>
    </div>
</template>

<script setup lang="ts">
import api from '@/api/axiosinterceptor';
import {onMounted, ref} from 'vue';

interface UserDepartmentDto {
  userId: number;            // 유저의 PK
  userName: string;       // 유저 이름
  userDeptName: string; // 부서 이름
}

const emit = defineEmits(['search'])

const selectedItem = ref();
const searchQuery = ref(null); // 검색어
const selectedKey = ref("전체"); // 키맨 여부 선택
const selectKey = ['전체','키맨','키맨아님'];
const userOptions = ref([]);
const selectedUser = ref(null);

const items = [
  '고객사명',
  '고객명',
  '전화번호',
  '메일'
]

onMounted(()=>{
    getPersonInChargeList();
});

const getPersonInChargeList=async()=>{
    try{
        const response = await api.get("/users");
        
        const data = response.data;
        // console.log(data);
        // console.log(data.result)
     
        if(data.code==200){
                userOptions.value = data.result.map((user:UserDepartmentDto)=>({
                id:user.userId,
                displayName: `${user.userName} (${user.userDeptName})`
            }));
    
            // console.log(userOptions.value);
        }

    }catch(err){
        console.log(`[ERROR 몌세지] : ${err}`);
    }
}


const search = ()=>{
    // todo : 검색 조건 초기화
    console.log('클릭')
    if(selectedItem.value==null || searchQuery.value==null){
        alert("검색조건과 검색어를 입력해주세요");
        return;
    }
    emit('search',{
        selectedItem:selectedItem.value?selectedItem.value:null,
        searchQuery:searchQuery.value?searchQuery.value:null,
        selectedKey:selectedKey.value?selectedKey.value:null,
        personInCharge:selectedUser.value?selectedUser.value.id:null
    });

}


</script>

<style lang="scss" scoped>

.title{
    margin-top: 30px;
    margin-left: 12px;
    font-size: 16px;
}

.select_row {
    margin-left: 4px;
    margin-right:4px;
}

.search_btn {
    width: 100%;
    text-align: center;
    margin-bottom: 20px;
}

</style>