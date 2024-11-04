<script setup>
import {profileCards} from '@/_mockApis/components/widget/card';
import { ref ,onMounted, watch,nextTick} from 'vue';
import user1 from '@/assets/images/profile/user-1.jpg';
import user2 from '@/assets/images/profile/user-2.jpg';
import user3 from '@/assets/images/profile/user-3.jpg';
import user4 from '@/assets/images/profile/user-4.jpg';
import user5 from '@/assets/images/profile/user-5.jpg';
import user6 from '@/assets/images/profile/user-6.jpg';
import user7 from '@/assets/images/profile/user-7.jpg';
import user8 from '@/assets/images/profile/user-8.jpg';
import user9 from '@/assets/images/profile/user-9.jpg';
import user10 from '@/assets/images/profile/user-10.jpg';
import { useRouter } from 'vue-router';

const router = useRouter();
const props = defineProps({
    customers:{
        type:Array,
        required:true
    }
});
// 프로필 이미지 배열
const avatarImgs = [user1, user2, user3, user4, user5, user6, user7,user8,user9,user10];

// 각 customer에 랜덤 이미지를 추가하는 함수
const getRandomImage = () => {
  const randomIndex = Math.floor(Math.random() * avatarImgs.length);
  return avatarImgs[randomIndex];
};

const goToEditPage = (customerId)=>{
    router.push({name:"CustomerDetail",params:{id:customerId}});

}

</script>

<template>
       <v-col cols="12">
        <v-row class="pt-3">
            <v-col cols="6" md="6" v-for="customer in customers" :key="customer.id" class="column">
                <v-card elevation="10" class="card text-center" rounded="md" @click="goToEditPage(customer.id)">
                    <v-card-item class="card_container">
                        <div class="title_container">
                            <v-avatar size="60" rounded="xl">
                                <!-- <img :src="getRandomImage()" alt="img" width="60"> -->
                                <i class="mr-2 mdi text-h1 mdi-account-circle"></i>
                            </v-avatar>
                            <div class="name_container">
                                    <div class="customer_name">{{ customer.name }} </div> 
                                    <div class="customer_position"> <span v-if="customer.position">( {{ customer.position }} )</span></div>
                            </div>
                        </div>

                        <div class="mt-4 info_container">
                        <div>
                            <div class="customer_position"> <span v-if="customer.company"> <i class="mr-2 mdi text-h5 mdi-domain"></i>Company. {{ customer.company }} </span></div>
                        </div>
                        <div>
                            <i class="mr-2 mdi text-h5 mdi-account-edit"></i>담당: {{ customer.userName }}
                        </div>
                      </div>
                    </v-card-item>
                    <div class="bottom_container">
                    <div v-if="customer.email" class="content"><i class="mr-2 mdi text-h5 mdi-email"></i><span>{{ customer.email }}</span></div>
                    <div v-if="customer.phone"><i class="mr-2 mdi text-h5 mdi-phone"></i>{{ customer.phone }} </div>
                    <!-- <div v-if="customer.tel">tel.{{ customer.tel }}</div> -->
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
    justify-content: space-evenly;
    color: #1a1818;

    div {
        padding-right:5px;
    }
   
}

</style>
