<template>
    <div class="container">
        
        <div class="filter_container">
            <pFilterCard @search="handleFilter"/> 
        </div>
    
        <div class="customer_container">
            <div class="header">
                <div class="result_count">(검색결과: {{ dataSize }}건)</div>   
                <v-btn variant="tonal" color="primary" to="/sales/prospect/add">잠재고객 추가</v-btn>
            </div>
         
            <hr  class="divider"></hr>
                  <pCustomerCard :pcustomers="pcustomers"/> 
        </div>
    </div>
</template>

<script setup>
import pCustomerCard from '@/components/pcustomer/pCustomerCard.vue';
import pFilterCard from '@/components/pcustomer/pFilterCard.vue';
import api from '@/api/axiosinterceptor'
import { computed, onMounted, ref } from 'vue';

const pcustomers = ref([]);
const dataSize = computed(()=> pcustomers.value.length);
const filters = ref({selectedItem:null,searchQuery:null,selecedContact:'전체'});

onMounted(()=>{
    fetchCustomers();
})

const fetchCustomers=async()=>{
    try{
        const res = await api.get('/pcustomers');
     //   console.log(res);
        if(res.data.code==200) {
    //        console.log(res.data.result);
            pcustomers.value = res.data.result;
        }
    }catch(err){
        console.log(`[ERROR 몌세지] : ${err}`);
    }
}

const handleFilter =(filterValues)=>{
    filters.value = filterValues;
    fetchpCustomersByFilterAPI();
}

const fetchpCustomersByFilterAPI =async()=>{
    try{
        const response = await api.post("/pcustomers",filters.value);
 //       console.log(response);
        if(response.data.code==200){
            pcustomers.value = response.data.result;
        }

    }catch(err){
        console.log(`[ERROR 몌세지] : ${err}`);
    }
}

</script>

<style lang="scss" scoped>
.header {
    font-size: 12px;
    margin:15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.container {
   
    display: flex;
    flex-direction: row;
//   background-color: yellow;
}

.filter_container {
    background-color: white;
    margin-right: 30px;
    width: 16%;
    height: 100%;
    border-radius: 8px;
}

.customer_container {
    background-color: white;
    width: 80%;
}
.divider{
    border-color:rgb(0, 110, 255);
    margin-left:15px;
    margin-right: 15px;
}

</style>