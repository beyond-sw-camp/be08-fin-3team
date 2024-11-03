<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import MyProfileBanner from '@/components/apps/user/MyProfileBanner.vue';
import api from '@/api/axiosinterceptor';


onMounted(() => {
    getPCustomersAPI();
});

const router = useRouter();
const page = ref({ title: '내 정보' });
const breadcrumbs = ref([
    {
        text: '메인',
        disabled: false,
        href: '/'
    },
    {
        text: '내 정보',
        disabled: true,
        href: '#'
    }
]);


const pcustomers = ref([]);
const dataSize = computed(()=> pcustomers.value.length);

const getPCustomersAPI=async()=>{
    try{

        const response = await api.get("/users/pcustomers");
        console.log(response);
        if(response.data.code == 200){
            const result = response.data.result;
       //     console.log(result);
            pcustomers.value = result;
        }

    }catch(err){
        console.log("[ERROR] : ",err);
    }
}

const goToEditPage = (pcustomerId)=>{
    router.push({name:"pCustomerDetail",params:{id:pcustomerId}});

}

</script>

<template>
     <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <MyProfileBanner/>
    <v-row class="justify-content-end mt-5">
        <v-col cols="12">
            <div class="d-sm-flex align-center mb-5">
                <h5 class="text-h5">
                    담당 잠재 고객
                    <v-chip size="small" class="ml-2 elevation-0" variant="elevated" color="secondary">{{ dataSize }}</v-chip>
                </h5>
            
            </div>

      


        <v-row class="pt-3">
            <v-col cols="12" md="4" sm="6"  v-for="pcustomer in pcustomers" :key="pcustomer.id" class="column">
                <v-card elevation="10" class="card text-center" rounded="md" @click="goToEditPage(pcustomer.id)">
                    <v-card-item class="card_container">
                        <div class="title_container">
                            <div class="name_container">
                                    <div class="customer_name">{{ pcustomer.name }}</div> 
                                    <div class="customer_position"> <span v-if="pcustomer.company">( <i class="mr-2 mdi text-h5 mdi-domain"></i> {{ pcustomer.company }} )</span></div>
                            </div>
                        </div>
                        <div class="mt-4 info_container">
                        
                        <!-- <div>관리자 : <span>{{ pcustomer. }}</span> </div> -->
                        <div><i class="mr-2 mdi text-h5 mdi-calendar"></i>등록일 : <span v-if="pcustomer.status">{{ pcustomer.registerDate }}</span></div>
                        <div><i class="mr-2 mdi text-h5 mdi-account-check"></i>접촉상태 : <span v-if="pcustomer.status">{{ pcustomer.status }}</span></div>
                      </div>
                    </v-card-item>
                    <div class="bottom_container">
                    <div><i class="mr-2 mdi text-h5 mdi-email"></i> {{ pcustomer.email }}</div>
                    <div><i class="mr-2 mdi text-h5 mdi-cellphone-basic"></i>{{ pcustomer.phone }} </div>
                
                </div>
                </v-card>

            </v-col>
           
     </v-row>
    </v-col>
    </v-row>
</template>
<style lang="scss">

.card_conatiner{
    display: flex;
    padding:20px 20px 20px 20px;

}
.title_container {
    display: flex;
    flex-direction: row;
}
.info_container {
    font-size: 14px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    // background-color: rgb(106, 106, 202);

}
.name_container {
    margin-left: 4px;
    display: flex;
    flex-direction: row;
    // background-color: yellow;
    align-items: center;
}

.customer_name {
    font-size: 16px;
    font-weight: 600;
}
.customer_position {
    font-size: 12px;
}

.bottom_container {
    padding:10px;
    background-color: rgb(228, 225, 225);
    font-size: 12px;
    display: flex;
    justify-content: center;
    color: #1a1818;

    div {
        padding-right:5px
    }
}
</style>