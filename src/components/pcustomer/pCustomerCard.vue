<script setup>
import { ref ,onMounted, watch,nextTick,defineProps} from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const props = defineProps({
    pcustomers:{
        type:Array,
        required:true
    }
});


// 각 customer에 랜덤 이미지를 추가하는 함수
const getRandomImage = () => {
  const randomIndex = Math.floor(Math.random() * avatarImgs.length);
  return avatarImgs[randomIndex];
};

const goToEditPage = (pcustomerId)=>{
    router.push({name:"pCustomerDetail",params:{id:pcustomerId}});

}

</script>

<template>
       <v-col cols="12">
        <v-row class="pt-3">
            <v-col cols="6" md="6" v-for="pcustomer in pcustomers" :key="pcustomer.id" class="column">
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
