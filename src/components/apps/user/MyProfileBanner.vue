<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue';
import { HeartIcon, PhotoIcon, UserCircleIcon, UsersIcon } from 'vue-tabler-icons';
import profileBg from '@/assets/images/backgrounds/profilebg.jpg';
import UserImage from '@/assets/images/profile/user-1.jpg';
import api from '@/api/axiosinterceptor';
import { useProfileImageStore } from '@/stores/userInfo';

const store = useProfileImageStore();
const profileImg = computed(()=>store.profileImg);
const tab = ref(null);
const items = shallowRef([
    { tab: '내 정보', icon: UserCircleIcon, href: '/apps/user/mypage' },
    { tab: '고객 관리', icon: HeartIcon, href: '/apps/user/mypage/customers' },
    { tab: '잠재고객 관리', icon: UsersIcon, href: '/apps/user/mypage/pcustomers' },
    // { tab: 'Gallery', icon: PhotoIcon, href: '/apps/user/profile/gallery' }
]);
// const props = defineProps({
//     name:String
// })
const name = ref();

onMounted(()=>{
    name.value = localStorage.getItem("loginUserName");
})
</script>

<template>
    <v-card elevation="10" class="overflow-hidden" >
        <img :src="profileBg" alt="profile" class="w-100" />
        <div>
            <v-row class="mt-1">
                <v-col cols="12" lg="4" sm="12" class="order-sm-second">
                    <div class="px-4 py-1">
                        <v-row class="justify-center">
                        </v-row>
                    </div>
                </v-col>
                <v-col cols="12" lg="4" sm="12" class="d-flex justify-center order-sml-first">
                    <div class="text-center top-spacer">
                        <div class="avatar-border">
                            <v-avatar size="100" class="userImage">
                                <img v-if="profileImg" :src="profileImg" width="100" alt="profile-img" />
                                <img v-else :src="UserImage" width="100" alt="Mathew" /> 
                            </v-avatar>
                        </div>
                        <h5 class="text-h5 mt-3">{{ name }}</h5>
                        <!-- <span class="text-h6 font-weight-regular">영업부</span> -->
                    </div>
                </v-col>
                <v-col md="12" class="order-sm-last">
                    <v-tabs v-model="tab" color="primary" dark class="profiletab bg-grey100">
                        <v-tab v-for="item in items" :key="item.tab" :to="item.href">
                            <component :is="item.icon" size="18" stroke-width="1.5" class="mr-2"></component>
                            {{ item.tab }}
                        </v-tab>
                    </v-tabs>
                </v-col>
            </v-row>
        </div>
    </v-card>
</template>
<style lang="scss">
.avatar-border {
    background-image: linear-gradient(rgb(80, 178, 252), rgb(244, 76, 102));
    border-radius: 50%;
    width: 110px;
    height: 110px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    .userImage {
        border: 4px solid rgb(255, 255, 255);
    }
}

.top-spacer {
    margin-top: -95px;
}

.profiletab .v-slide-group__content {
    justify-content: end;
    .v-btn--variant-text .v-btn__overlay {
        background: transparent;
    }
}

@media (max-width: 1023px) {
    .order-sm-second {
        order: 2;
    }
    .order-sml-first {
        order: 1;
    }
    .order-sm-third {
        order: 3;
    }
    .order-sm-last {
        order: 4;
    }
}

.btn-brand-facebook {
    background-color: rgb(24, 119, 242) !important;
}

.btn-brand-twitter {
    background-color: rgb(29, 161, 242) !important;
}
.btn-brand-dribbble {
    background-color: rgb(234, 76, 137) !important;
}
.btn-brand-youtube {
    background-color: rgb(205, 32, 31) !important;
}
</style>
