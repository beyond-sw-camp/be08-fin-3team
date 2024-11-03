<script setup>
import { ref, onMounted, computed } from 'vue';
import { HeartIcon, UsersIcon, TrashIcon } from 'vue-tabler-icons';
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
import MyProfileBanner from '@/components/apps/user/MyProfileBanner.vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import { useFrinedsStore } from '@/stores/apps/userprofile/friends';
import api from '@/api/axiosinterceptor';
import { useRouter } from 'vue-router';

const store = useFrinedsStore();

const router = useRouter();

onMounted(() => {
    getUserInfoAPI();
    getCustomersAPI();
});

const getUserInfoAPI=async()=>{
    try{
        const response = await api.get("/users/my-info");
        console.log(response);
        if(response.data.code==200){
            const result = response.data.result;
            email.value = result.email;
            dept.value = result.department;
            employeeId.value = result.employeeId;
            joinDate.value = result.joinDate;
            name.value = result.name;
        }
    }catch(err){
        console.log(`[ERROR 몌세지] : ${err}`);
    }

}
// 프로필 이미지 배열
const avatarImgs = [user1, user2, user3, user4, user5, user6, user7,user8,user9,user10];
const searchValue = ref('');
// dropdown data
const actionDD = ref([
    { title: 'Favorite', icon: HeartIcon },
    { title: 'Edit Friend List', icon: UsersIcon },
    { title: 'Remove', icon: TrashIcon }
]);
const dept = ref('');
const email = ref('');
const employeeId = ref('')
const joinDate = ref('')
const name = ref('')

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
const customers = ref([]);
const dataSize = computed(()=> customers.value.length);
const getCustomersAPI=async()=>{
    try{

        const response = await api.get("/users/customers");
        console.log(response);
        if(response.data.code == 200){
            const result = response.data.result;
            console.log(result);
            customers.value = result;
        }

    }catch(err){
        console.log("[ERROR] : ",err);
    }

}

const getRandomImage = () => {
  const randomIndex = Math.floor(Math.random() * avatarImgs.length);
  return avatarImgs[randomIndex];
};
const goToEditPage = (customerId)=>{
    router.push({name:"CustomerDetail",params:{id:customerId}});

}

</script>

<template>
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <MyProfileBanner :name="name"/>
    <v-row class="justify-content-end mt-5">
        <v-col cols="12">
            <div class="d-sm-flex align-center mb-5">
                <h3 class="text-h3">
                    담당 고객
                    <v-chip size="small" class="ml-2 elevation-0" variant="elevated" color="secondary">{{ dataSize }}</v-chip>
                </h3>
                <!-- <v-sheet width="250" class="ml-0 ml-sm-auto mt-3 mt-sm-0">
                    <v-text-field
                        color="primary"
                        hide-details
                        variant="outlined"
                        placeholder="Search Friends"
                        density="compact"
                        prepend-inner-icon="mdi-magnify"
                        v-model="searchValue"
                    >
                    </v-text-field>
                </v-sheet> -->
            </div>

            <v-row>
                <v-col cols="12" md="4" sm="6" v-for="customer in customers" :key="customer.id" @click="goToEditPage(customer.id)">
                    <v-card elevation="10" class="card-hover">
                        <v-card-item class="text-center">
                             <v-avatar size="80">
                                <i class="mr-2 mdi text-h1 mdi-account-circle"></i>
                                <!-- <img :src="getRandomImage()" alt="image" width="80" />  -->
                            </v-avatar> 
                            
                            <h4 class="text-h5 mt-3">{{ customer.name }}</h4>
                            <div class="container">
                                <span class="text-truncate d-block gap-2 text-subtitle-1" v-if="customer.keyman">
                                    <i class="mr-2 mdi text-h5 mdi-account-key"></i>키맨
                                </span>
                                <span class="text-truncate d-block gap-2 text-subtitle-1" v-if="customer.company">
                                    <i class="mr-2 mdi text-h5 mdi-tag"></i>{{ customer.grade }} 
                                </span>
                            </div>
                           
                            
                        </v-card-item>
                        <v-divider />
                        <v-sheet class="bg-grey100 px-4 py-2 d-flex align-center justify-center gap-2">
                            <span class="text-truncate d-block gap-2 text-subtitle-1" v-if="customer.company">
                                <i class="mr-2 mdi text-h5 text-h5 mdi-phone"></i>{{ customer.phone }}
                            </span>
                        </v-sheet>
                    </v-card>
                </v-col>
            </v-row>
        </v-col>
    </v-row>
</template>

<style lang="scss" scoped>
.text-facebook {
    color: rgb(24, 119, 242) !important;
}
.text-instagram {
    color: rgb(215, 51, 109) !important;
}
.text-github {
    color: rgb(0, 96, 151) !important;
}
.text-twitter {
    color: rgb(28, 156, 234) !important;
}

.container{
    display: flex;
    justify-content: space-around;
}
</style>
