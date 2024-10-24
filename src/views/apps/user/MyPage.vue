<script setup lang="ts">
import { onMounted, ref } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';

// components
import MyProfileBanner from '@/components/apps/user/MyProfileBanner.vue';
import MyIntroCard from '@/components/apps/user/MyIntroCard.vue';
import PostListing from '@/components/apps/user-profile/PostListing.vue';
import AddPost from '@/components/apps/user-profile/posts/AddPost.vue';
import api from '@/api/axiosinterceptor';

onMounted(()=>{
    getUserInfoAPI();
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
const dept = ref('');
const email = ref('');
const employeeId = ref('')
const joinDate = ref('')
const name = ref('')

</script>

<template>
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <MyProfileBanner :name="name"/>
    <v-row class="mt-4">
        <v-col cols="12" >
            <IntroCard />
            <MyIntroCard :name="name" :email="email" :dept="dept" :employeeId="employeeId" :joinDate="joinDate"/>
        </v-col>
        <!-- <v-col cols="12" lg="8" md="8">
            <AddPost />
            <PostListing />
        </v-col> -->
    </v-row>
</template>
