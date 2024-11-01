<template>
    <div class="container">
        
        <div class="filter_container">
            <FilterCard @search="handleFilters"/> 
        </div>
    
        <div class="customer_container">
            <div class="header">
                <div class="result_count">(검색결과: {{ dataSize }}건)</div>   
                <v-btn variant="tonal" color="primary" to="/sales/customer-add">고객 생성</v-btn>
            </div>
            <hr  class="divider"></hr>
                <CustomerCard :customers="customers"/>
        </div>
    </div>
</template>

<script setup>
import CustomerCard from '@/components/customer/CustomerCard.vue';
import FilterCard from '@/components/customer/FilterCard.vue';
import axios from 'axios';
import api from '@/api/axiosinterceptor'
import { computed, onMounted, ref } from 'vue';

const customers = ref([]);
const dataSize = computed(()=> customers.value.length);
const filters = ref({
  selectedItem: null,
  searchQuery: null,
  selectedKey: '전체',
  personInCharge: null
});

onMounted(()=>{
  fetchCustomersByFilterAPI();
  //fetchCustomers();
})

const handleFilters=(filterValues)=>{
 //   console.log(filterValues.personInCharge);
    filters.value = filterValues;
    fetchCustomersByFilterAPI();
}

const fetchCustomers=async()=>{
    try{
        const res = await api.get('/customers');
        if(res.data.code==200) {
       //     console.log(res.data.result);
            customers.value = res.data.result;
        }
    }catch(err){
        console.log(`[ERROR 몌세지] : ${err}`);
    }
    
}

const fetchCustomersByFilterAPI = async()=>{

    try{
        const response = await api.post('/customers',filters.value);
      //  console.log(response);
        if(response.data.code==200){
            customers.value = response.data.result;
        }

    }catch(err){
        console.log(`[ERROR] : ${err}`);
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